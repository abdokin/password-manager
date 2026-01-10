Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :passwords, only: [:index, :show, :create, :update, :destroy] do
        member do
          post :toggle_favorite
          get :history
        end
      end
      get "health", to: "health#show"
    end
  end
end
