import { QueryOptions, MutationOptions } from '@tanstack/react-query';

export const defaultQueryOptions: QueryOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
};

export const defaultMutationOptions: MutationOptions = {
  retry: false,
};
