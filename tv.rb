#!/usr/bin/ruby
begin  # initialization
	require "rubygems"
	require "sinatra"
	require "json"
  if "live"==ARGV[0]
    set :environment, :production
  else
    require "sinatra/reloader"
    require "pp"
  end
  TVDIR = "public/video"
  # OpenID
  require "rack/openid"
  use Rack::OpenID
  # use session for login state management
  use Rack::Session::Cookie
  enable :sessions
  # load application config
  begin
    require 'yaml'
    conf = YAML.load_file('conf.yaml')
    USER = conf[:user]
  rescue
    USER = nil
  end
end

# recorded item entity.
# use ruby internal hash to identify each instance.
class Item
	attr_reader :ch, :title, :mpgname, :url, :time

	def initialize(url)
		dum, dum, date_ch, ename, hour, min, ext = url.split(/[\/_.]/)
		mpgname = Dir["#{TVDIR}/#{date_ch}_*_#{hour}.#{min}.mpg"][0]
		return nil unless mpgname
		h = {}
		@mpgname = mpgname.sub(/public/,'')
		@title = mpgname.sub(/.*\/.+_(.+)_.+\.mpg/,'\1')
		@url = url.sub(/public/,'')
		@ch = date_ch.sub(/\d+/,'')
		date_ch =~ /^(..)(..)(..).*/
		@time = Time.local($1, $2, $3, hour, min)
		return nil unless @time
	end

	def self.list(sort_key=nil)
    items = 
      Dir["#{TVDIR}/*.{flv,mp4}"].map {|file| Item.new(file)}.
        compact.reject {|i| nil == i.time}
		if sort_key 
      items.sort_by {|i| i.__send__(sort_key)}
    else
      items
    end
	end

	def to_json(*a)
		hash = {}
		hash[:ch] = @ch
		hash[:title] = @title
		hash[:mpgname] = @mpgname
		hash[:url] = @url
		hash[:time] = @time
		hash.to_json(*a)
	end

	def delete
		File.delete("public/" + @mpgname)
		File.delete("public/" + @url)
		[mpgname, url]
	end
end

helpers do
	def loggedin?
		:development == Sinatra::Application.environment or session[:loggedin]
	end
	def authenticate(email)
		session[:loggedin] = (USER == email)
	end
end

get '/' do
	redirect '/index.html'
end

get '/items' do
	content_type :json
	if loggedin?
		Item.list((request["sort"] || :time).to_sym).to_json
	end
end

post '/login' do
  if resp = request.env["rack.openid.response"]
		if resp.status == :success
			ax = OpenID::AX::FetchResponse.from_success_response(resp);
			authenticate(ax["http://axschema.org/contact/email"][0])
			redirect '/'
		end
  else
		headers 'WWW-Authenticate' => Rack::OpenID.build_header(
			:identifier => "www.google.com/accounts/o8/id",
			:required => ["http://axschema.org/contact/email"]
		)
    throw :halt, [401, 'openid auth failure']
  end
end

get '/logout' do
	authenticate(nil)
	redirect '/'
end

post '/delete' do
	if loggedin?
		Item.new(params["path"]).delete
	end
end
