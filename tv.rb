#!/usr/bin/ruby
begin
	require "rubygems"
	require "sinatra"
	require "haml"
end
if "live"==ARGV[0]
	set :environment, :production
else
	require "sinatra/reloader"
	require "ruby-debug"
end
TVDIR = "public/video"
set :haml, {:format => :html5}

# recorded item entity.
# use ruby internal hash to identify each instance.
class Item
	attr_reader :ch, :title, :mpgname, :flvname, :time

	def initialize(flvname)
		dum, dum, date_ch, ename, hour, min, ext = flvname.split(/[\/_.]/)
		mpgname = Dir["#{TVDIR}/#{date_ch}_*_#{hour}.#{min}.mpg"][0]
		return nil unless mpgname
		h = {}
		@mpgname = mpgname.sub(/public\//,'')
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

use Rack::Auth::Basic do |username, password|
	[username, password] == ['tosh', 't30vmi=']
end

get '/' do
	@items = Item.list((request["sort"] || :time).to_sym)
	haml :index
end

get '/delete' do
	a = Item.new(params["pathname"]).delete
	"Deleted: #{a[0]} & #{a[1]}"
end
