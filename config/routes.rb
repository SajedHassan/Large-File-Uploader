Rails.application.routes.draw do
  constraints Rodauth::Rails.authenticated do
    namespace :api do
      namespace :v1 do
        resources :documents, only: [:index, :destroy] do
          collection do
            post :prepare
            post :new_upload
          end
        end
      end
    end

    resources :documents, only: :index
  end

  root to: "home#index"
end
