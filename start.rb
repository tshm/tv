#!/usr/bin/ruby -Ku
require 'rubygems'
require 'ramaze'
$LOAD_PATH.unshift(__DIR__)  # add project home dir to ruby load_path
require 'tv'

unless ARGV.empty?
	require "ruby-debug"
	Ramaze.options.mode = :dev
	Ramaze::Log.level = Logger::DEBUG
else #deploy mode
	Ramaze.options.mode = :live
	Ramaze::Log.level = Logger::INFO
	Ramaze::Log.loggers << Ramaze::Logger::Informer.new("ramaze.log")
end

Ramaze.start :adapter => :mongrel, :root => '.'
