begin
	require "rubygems"
	require "ramaze"
	require "yaml"
	#require "logger"
	#require "date"
	require 'ramaze/log/informer'
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
		if sort_key
			items.sort_by {|i| i.__send__(sort_key)}
		else
			items
		end
	end

	def delete
		File.delete("public/" + @mpgname)
		File.delete("public/" + @flvname)
		[mpgname, flvname]
	end
end

class MainController < Ramaze::Controller
	layout :layout
	helper :aspect, :stack
	[:index, :delete].each do |link|
		before(link) { call :login unless session[:loggedin] }
	end

	def login
		@title = ""
		if request.post?
			session[:loggedin] = !CONF['id'] || (CONF['id']==request[:id] && CONF['passwd']==request[:passwd])
			sleep 30 unless session[:loggedin]
			answer if inside_stack?
		end
	end

	def index
		@title = "tv"
		sort_key = request["sort"] ? request["sort"].to_sym : nil
		@items = Item.list(sort_key) if session[:loggedin]
	end

	def delete
		a = Item.new(request[:pathname]).delete
		flash[:message] = "Deleted: #{a[0]} & #{a[1]}"
		redirect_referer
	end
end
