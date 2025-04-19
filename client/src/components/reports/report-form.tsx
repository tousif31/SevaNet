import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, categoriesDisplay } from "@shared/schema";
import { Map } from "../ui/map";
import { UploadPhoto } from "./upload-photo";

const formSchema = insertReportSchema.extend({
  photos: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [location, setLocation] = useState({
    latitude: "40.7128",
    longitude: "-74.0060"
  });
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      address: "",
      neighborhood: "",
      latitude: location.latitude,
      longitude: location.longitude,
      userId: user?.id,
    },
  });
  
  // Update location in form when map selection changes
  const handleLocationSelect = (lat: string, lng: string) => {
    setLocation({ latitude: lat, longitude: lng });
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
  };
  
  // Get user's current location using GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingGPS(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ 
          latitude: latitude.toString(), 
          longitude: longitude.toString() 
        });
        form.setValue("latitude", latitude.toString());
        form.setValue("longitude", longitude.toString());
        setIsLoadingGPS(false);
        
        toast({
          title: "Location updated",
          description: "Your current location has been set.",
        });
      },
      (error) => {
        setIsLoadingGPS(false);
        let errorMessage = "Unable to retrieve your location";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get your location timed out.";
            break;
        }
        
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };
  
  // Handle photo selection
  const handlePhotoSelected = (files: FileList) => {
    setSelectedFiles(files);
  };
  
  // Submit report mutation
  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const formData = new FormData();
      
      // Add form fields to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add photos if any
      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file) => {
          formData.append('photos', file);
        });
      }
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: "Report submitted",
        description: "Your report has been successfully submitted.",
      });
      navigate("/my-reports");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission
  const onSubmit = (values: FormValues) => {
    submitMutation.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Pothole on Main Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {categoriesDisplay[category as keyof typeof categoriesDisplay]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please provide details about the issue..." 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Location</FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLoadingGPS}
              className="flex items-center"
            >
              {isLoadingGPS ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Location...</>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Use My Current Location
                </>
              )}
            </Button>
          </div>
          <Map 
            latitude={location.latitude}
            longitude={location.longitude}
            selectable={true}
            onLocationSelect={handleLocationSelect}
            height="300px"
          />
          <div className="mt-2 text-sm text-gray-500">
            <p>You can set the location by:</p>
            <ul className="list-disc pl-5">
              <li>Using the "Use My Current Location" button for GPS tracking</li>
              <li>Clicking directly on the map</li>
              <li>Dragging the marker to the desired location</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 123 Main Street" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Neighborhood</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Downtown" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel className="block mb-2">Upload Photos</FormLabel>
          <UploadPhoto onPhotoSelected={handlePhotoSelected} />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            'Submit Report'
          )}
        </Button>
      </form>
    </Form>
  );
}
