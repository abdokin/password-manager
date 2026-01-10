Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  
  namespace :api do
    namespace :v1 do
      post "auth/magic_link", to: "auth#magic_link"
      post "auth/verify", to: "auth#verify"
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"
      
      resources :organizations, only: [:index, :show, :create, :update, :destroy] do
        get "audit", to: "audit#show"
        get "activity_logs", to: "activity_logs#index"
        post "import", to: "import_export#import"
        get "export", to: "import_export#export"
        
        resources :payments, only: [] do
          collection do
            get "plans", to: "payments#plans"
            post "checkout", to: "payments#create_checkout"
            get "subscription", to: "payments#subscription"
            post "cancel", to: "payments#cancel_subscription"
          end
        end
        post "payments/webhook", to: "payments#webhook"
        
        resources :team_members, only: [:index, :create, :update, :destroy]
        resources :invoices, only: [:index, :show] do
          member do
            get "download", to: "invoices#download"
          end
        end
        get "analytics/usage", to: "analytics#usage"
        
        resources :passwords, only: [:index, :show, :create, :update, :destroy] do
          member do
            post :toggle_favorite
            get :history
          end
        end
        resources :categories, only: [:index, :show, :create, :update, :destroy]
        resources :tags, only: [:index, :show, :create, :update, :destroy]
        resources :environments, only: [:index, :show, :create, :update, :destroy] do
          get "variables", to: "environments#variables"
          post "variables", to: "environments#add_variable"
          get "variables/:key", to: "environments#get_variable"
          put "variables/:key", to: "environments#update_variable"
          delete "variables/:key", to: "environments#delete_variable"
          get "accesses", to: "environments#accesses"
          post "accesses", to: "environments#grant_access"
          delete "accesses", to: "environments#revoke_access"
        end
      end
      
      resources :passwords, only: [:index, :show, :create, :update, :destroy] do
        member do
          post :toggle_favorite
          get :history
        end
      end
      
      resources :activity_logs, only: [:index]
      resources :password_shares, only: [:index, :create, :destroy]
      resources :user_settings, only: [:index, :show, :create, :update]
      resources :api_keys, only: [:index, :create] do
        member do
          post "revoke", to: "api_keys#revoke"
        end
      end
      resources :notifications, only: [:index] do
        member do
          post "read", to: "notifications#mark_as_read"
        end
        collection do
          post "read_all", to: "notifications#mark_all_as_read"
        end
      end
      resources :feature_flags, only: [:index, :show, :create, :update] do
        member do
          post "toggle", to: "feature_flags#toggle"
          post "override", to: "feature_flags#set_override"
          delete "override", to: "feature_flags#remove_override"
        end
      end
      
      post "bulk/delete", to: "bulk_operations#delete"
      post "bulk/toggle_favorite", to: "bulk_operations#toggle_favorite"
      post "bulk/move_to_category", to: "bulk_operations#move_to_category"
      
      post "password_generator", to: "password_generator#create"
      get "health", to: "health#show"
    end
  end
end
