import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: string;
};

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type Drug = {
  __typename?: 'Drug';
  brandName?: Maybe<Scalars['String']>;
  drugClass?: Maybe<Scalars['String']>;
  genericName?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  releasedOn?: Maybe<Scalars['Date']>;
  schedule?: Maybe<DrugSchedule>;
};

export enum DrugSchedule {
  CI = 'C_I',
  CIi = 'C_II',
  CIii = 'C_III',
  CIv = 'C_IV',
  CV = 'C_V'
}

export type Query = {
  __typename?: 'Query';
  drugById?: Maybe<Drug>;
  randomDrug?: Maybe<Drug>;
  top200Drugs?: Maybe<Array<Maybe<Drug>>>;
};


export type QueryDrugByIdArgs = {
  id: Scalars['Int'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CacheControlScope: CacheControlScope;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Drug: ResolverTypeWrapper<Drug>;
  DrugSchedule: DrugSchedule;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Date: Scalars['Date'];
  Drug: Drug;
  Int: Scalars['Int'];
  Query: {};
  String: Scalars['String'];
};

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars['Boolean']>;
  maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = Context, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DrugResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Drug'] = ResolversParentTypes['Drug']> = {
  brandName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  drugClass?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  genericName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  releasedOn?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  schedule?: Resolver<Maybe<ResolversTypes['DrugSchedule']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  drugById?: Resolver<Maybe<ResolversTypes['Drug']>, ParentType, ContextType, RequireFields<QueryDrugByIdArgs, 'id'>>;
  randomDrug?: Resolver<Maybe<ResolversTypes['Drug']>, ParentType, ContextType>;
  top200Drugs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Drug']>>>, ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Date?: GraphQLScalarType;
  Drug?: DrugResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = Context> = {
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};
