class AuthMailer < ApplicationMailer
  def magic_link_email(user, token)
    @user = user
    @token = token
    @magic_link_url = "#{Rails.application.config.action_mailer.default_url_options[:host]}:#{Rails.application.config.action_mailer.default_url_options[:port]}/api/v1/auth/verify?token=#{token}"
    
    mail(
      to: @user.email,
      subject: 'Your Password Manager Magic Link'
    )
  end
end
