Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/magic_link", to: "auth#magic_link"
      post "auth/verify", to: "auth#verify"
      
      resources :organizations, only: [:index, :show, :create, :update, :destroy]
      
      resources :organizations, only: [] do
        resources :passwords, only: [:index, :show, :create, :update, :destroy] do
          member do
            post :toggle_favorite
            get :history
          end
        end
        resources :categories, only: [:index, :show, :create, :update, :destroy]
        resources :tags, only: [:index, :show, :create, :update, :destroy]
      end
      
      resources :passwords, only: [:index, :show, :create, :update, :destroy] do
        member do
          post :toggle_favorite
          get :history
        end
      end
      
      post "password_generator", to: "password_generator#create"
      get "health", to: "health#show"
    end
  end
end
