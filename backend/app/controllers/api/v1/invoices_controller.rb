module Api
  module V1
    class InvoicesController < ApplicationController
      before_action :set_organization
      
      def index
        @invoices = Invoice.where(organization: @organization).order(created_at: :desc)
        render json: @invoices
      end
      
      def show
        @invoice = Invoice.find(params[:id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless @invoice.organization_id == @organization.id
        
        render json: @invoice
      end
      
      def download
        @invoice = Invoice.find(params[:id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless @invoice.organization_id == @organization.id
        
        render json: { 
          invoice_number: @invoice.invoice_number,
          amount: @invoice.amount,
          currency: @invoice.currency,
          status: @invoice.status,
          issue_date: @invoice.issue_date,
          due_date: @invoice.due_date
        }
      end
      
      private
      
      def set_organization
        @organization = Organization.find(params[:organization_id])
      end
    end
  end
end
