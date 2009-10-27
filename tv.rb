begin
	require "rubygems"
	require "ramaze"
	require "yaml"
	#require "logger"
	#require "date"
	require 'ramaze/log/informer'
end

# recorded item entity.
# use ruby internal hash to identify each instance.
class Item
	def self.list
		Dir["public/video/*.flv"].map do |flvname|
			dum, dum, date_ch, ename, hour, min, ext = flvname.split(/[\/_.]/)
			mpgname = Dir["public/video/#{date_ch}_*_#{hour}.#{min}.mpg"][0]
			next unless mpgname
			h = {}
			h[:mpgname] = mpgname.sub(/public\//,'')
			h[:title] = mpgname.sub(/.*\/.+_(.+)_.+\.mpg/,'\1')
			h[:filename] = flvname.sub(/public/,'')
			h[:date] = date_ch.sub(/^(..)(..)(..).*/,'\1.\2.\3')
			h[:ch] = date_ch.sub(/\d+/,'')
			h[:hour] = hour
			h[:min] = min
			h
		end
	end

	def self.delete(pathname)
		dum, dum, date_ch, ename, hour, min, ext = pathname.split(/[\/_.]/)
		mpgname = Dir["public/video/#{date_ch}_*_#{hour}.#{min}.mpg"][0]
		flvname = Dir["public#{pathname}"][0]
		File.delete(mpgname)
		File.delete(flvname)
		[mpgname, flvname]
	end
end

class MainController < Ramaze::Controller
	layout :layout

	def index
		@title = "tv"
		if request.post?
			session[:loggedin] = !CONF['id'] || (CONF['id']==request[:id] && CONF['passwd']==request[:passwd])
			redirect_referer
		else
			@items = Item.list if session[:loggedin]
		end
	end

	def delete
		a = Item.delete(request[:id])
		flash[:message] = "Deleted: #{a[0]} & #{a[1]}"
		redirect_referer
	end
end
