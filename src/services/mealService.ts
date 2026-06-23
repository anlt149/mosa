import { supabase } from '../lib/supabaseClient';

export interface Meal {
  id: string;
  user_id: string;
  location_type: 'eat_out' | 'eat_home';
  image_url: string | null;
  created_at: string;
}

export const mealService = {
  async uploadImageAndLogMeal(
    locationType: 'eat_out' | 'eat_home',
    imageBlob: Blob | null,
    filename?: string
  ): Promise<Meal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let finalImageUrl = null;

    if (imageBlob && filename) {
      // 1. Get pre-signed URL from edge function
      const { data: signData, error: signError } = await supabase.functions.invoke('generate-r2-upload-url', {
        body: { filename, contentType: imageBlob.type },
      });

      if (signError) {
        console.error('Error generating signed URL:', signError);
        throw new Error('Failed to generate upload URL');
      }

      if (signData?.error) {
         console.error('Edge function error:', signData.error);
         throw new Error(signData.error);
      }

      const { uploadUrl, publicUrl } = signData;

      // 2. Upload directly to Cloudflare R2 using fetch
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': imageBlob.type,
        },
        body: imageBlob,
      });

      if (!uploadResponse.ok) {
        console.error('Failed to upload to R2:', await uploadResponse.text());
        throw new Error('Failed to upload image to Cloudflare R2');
      }

      finalImageUrl = publicUrl;
    }

    // 3. Save to Supabase Database
    const { data: mealData, error: dbError } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        location_type: locationType,
        image_url: finalImageUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to log meal');
    }

    return mealData as Meal;
  },

  async getRecentMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as Meal[];
  },

  async getAllMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Meal[];
  }
};
