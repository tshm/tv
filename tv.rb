#!/usr/bin/ruby
begin
	require "rubygems"
	#require "bundler/setup"
	require "haml"
	require "sinatra"
end
if "live"==ARGV[0]
	set :environment, :production
else
	require "sinatra/reloader"
	require "pp"
end
TVDIR = "public/video"

# recorded item entity.
# use ruby internal hash to identify each instance.
class Item
	attr_reader :ch, :title, :mpgname, :flvname, :time

	def initialize(flvname)
		dum, dum, date_ch, ename, hour, min, ext = flvname.split(/[\/_.]/)
		mpgname = Dir["#{TVDIR}/#{date_ch}_*_#{hour}.#{min}.mpg"][0]
		return nil unless mpgname
		h = {}
		@mpgname = mpgname.sub(/public/,'')
		@title = mpgname.sub(/.*\/.+_(.+)_.+\.mpg/,'\1')
		@flvname = flvname.sub(/public/,'')
		@ch = date_ch.sub(/\d+/,'')
		date_ch =~ /^(..)(..)(..).*/
		@time = Time.local($1, $2, $3, hour, min)
		return nil unless @time
	end

	def self.list(sort_key=nil)
		items = Dir["#{TVDIR}/*.flv"].map {|flvname| Item.new(flvname)}.compact.reject {|i| nil == i.time}
		sort_key ? items.sort_by {|i| i.__send__(sort_key)} : items
	end

	def delete
		File.delete("public/" + @mpgname)
		File.delete("public/" + @flvname)
		[mpgname, flvname]
	end
end

USER = "shimayama@gmail.com"
use Rack::Session::Cookie
require "rack/openid"
use Rack::OpenID
enable :sessions

helpers do
	def loggedin?; session[:loggedin]; end
	def authenticate(email)
		session[:loggedin] = USER == email
	end
end

get '/' do
	@items = Item.list((request["sort"] || :time).to_sym)
	haml :index
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

get '/delete' do
	if loggedin?
		a = Item.new(params["pathname"]).delete
		"Deleted: #{a[0]} & #{a[1]}"
	end
end
