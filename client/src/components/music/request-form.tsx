import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { songRequestSchema } from "@shared/schema";

const formSchema = songRequestSchema.extend({
  requesterName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
      requesterName: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await apiRequest("POST", "/api/queue", values);
      
      // Reset form and show success message
      form.reset();
      toast({
        title: "Song Requested",
        description: "Your song has been added to the queue",
      });
      
      // Refresh queue
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/recent'] });
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Failed to add song to queue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="youtubeUrl"
          render={({ field }) => (
            <FormItem className="glass-effect rounded-xl p-4 shadow-sm">
              <FormLabel className="text-white font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-custom mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                YouTube URL or Video ID
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-custom">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-custom/70">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </div>
                  <Input 
                    placeholder="https://youtube.com/watch?v=..." 
                    className="bg-dark-lighter/50 border-gray-700/50 text-white pl-10 h-12 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs font-medium mt-1" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="requesterName"
          render={({ field }) => (
            <FormItem className="glass-effect rounded-xl p-4 shadow-sm">
              <FormLabel className="text-white font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-custom mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Name (Optional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-custom">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <Input 
                    placeholder="Enter your name (will be shown with the song)" 
                    className="bg-dark-lighter/50 border-gray-700/50 text-white pl-10 h-12 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <p className="text-gray-custom text-xs mt-1">Your name will be displayed next to the song in the queue</p>
              <FormMessage className="text-xs font-medium mt-1" />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between pt-2">
          <p className="text-gray-custom text-xs max-w-xs">
            By submitting, you agree that the song is appropriate for all audiences
          </p>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-8 py-6 rounded-xl shadow-custom pulse-on-hover flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding to Queue...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add to Queue
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
