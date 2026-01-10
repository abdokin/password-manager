module Api
  module V1
    class ImportExportController < ApplicationController
      def export
        organization_id = params[:organization_id]
        passwords = Password.where(organization_id: organization_id)
        
        data = passwords.map do |p|
          {
            name: p.name,
            username: p.username,
            password: p.password,
            url: p.url,
            notes: p.notes,
            favorite: p.favorite,
            expires_at: p.expires_at,
            created_at: p.created_at,
            updated_at: p.updated_at,
          }
        end
        
        format = params[:format] || 'json'
        
        if format == 'csv'
          csv_data = CSV.generate(headers: true) do |csv|
            csv << ['Name', 'Username', 'Password', 'URL', 'Notes', 'Favorite', 'Expires At', 'Created At', 'Updated At']
            data.each do |row|
              csv << [row[:name], row[:username], row[:password], row[:url], row[:notes], row[:favorite], row[:expires_at], row[:created_at], row[:updated_at]]
            end
          end
          send_data csv_data, filename: "passwords_#{Time.current.to_i}.csv", type: 'text/csv'
        else
          render json: { passwords: data }
        end
      end
      
      def import
        organization_id = params[:organization_id]
        user_id = params[:user_id] || 1
        format = params[:format] || 'json'
        data = params[:data]
        
        imported = 0
        errors = []
        
        if format == 'csv'
          require 'csv'
          csv = CSV.parse(data, headers: true)
          csv.each_with_index do |row, index|
            password = Password.new(
              name: row['Name'],
              username: row['Username'],
              password: row['Password'],
              url: row['URL'],
              notes: row['Notes'],
              favorite: row['Favorite'] == 'true',
              expires_at: row['Expires At'],
              organization_id: organization_id,
              user_id: user_id
            )
            if password.save
              imported += 1
            else
              errors << "Row #{index + 2}: #{password.errors.full_messages.join(', ')}"
            end
          end
        else
          json_data = JSON.parse(data)
          json_data.each_with_index do |row, index|
            password = Password.new(
              name: row['name'] || row[:name],
              username: row['username'] || row[:username],
              password: row['password'] || row[:password],
              url: row['url'] || row[:url],
              notes: row['notes'] || row[:notes],
              favorite: row['favorite'] || row[:favorite] || false,
              expires_at: row['expires_at'] || row[:expires_at],
              organization_id: organization_id,
              user_id: user_id
            )
            if password.save
              imported += 1
            else
              errors << "Item #{index + 1}: #{password.errors.full_messages.join(', ')}"
            end
          end
        end
        
        render json: { imported: imported, errors: errors }
      end
    end
  end
end

