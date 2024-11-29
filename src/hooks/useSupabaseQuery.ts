import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function useSupabaseQuery<T>(
  key: string[],
  table: string,
  options: {
    select?: string;
    match?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  } = {}
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        let query = supabase
          .from(table)
          .select(options.select || '*');

        if (options.match) {
          query = query.match(options.match);
        }

        if (options.order) {
          query = query.order(options.order.column, {
            ascending: options.order.ascending ?? true
          });
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error(`Error fetching ${table}:`, error);
          throw error;
        }

        return data as T[];
      } catch (error) {
        console.error(`Failed to fetch ${table}:`, error);
        toast.error(`Failed to fetch ${table}`);
        throw error;
      }
    }
  });
}

export function useSupabaseMutation<T>(
  table: string,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { type: 'insert' | 'update' | 'delete'; data: any }) => {
      try {
        let response;

        switch (variables.type) {
          case 'insert':
            response = await supabase
              .from(table)
              .insert(variables.data)
              .select()
              .single();
            break;
          case 'update':
            response = await supabase
              .from(table)
              .update(variables.data)
              .eq('id', variables.data.id)
              .select()
              .single();
            break;
          case 'delete':
            response = await supabase
              .from(table)
              .delete()
              .eq('id', variables.data.id);
            break;
        }

        if (response.error) {
          console.error(`Error in ${variables.type} operation on ${table}:`, response.error);
          throw response.error;
        }

        return response.data as T;
      } catch (error) {
        console.error(`Failed to ${variables.type} ${table}:`, error);
        toast.error(`Failed to ${variables.type} ${table}`);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [table] });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    }
  });
}

export function useSupabaseRealtime<T>(
  table: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T | null;
    old: T | null;
  }) => void
) {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T,
          old: payload.old as T
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}