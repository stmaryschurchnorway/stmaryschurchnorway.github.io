# Jekyll plugin to load environment variables into site.config
# This reads environment variables and makes them available in Liquid templates

Jekyll::Hooks.register :site, :post_read do |site|
  Jekyll.logger.info "=== env_variables.rb plugin running ==="

  # Load Google API key from environment variable
  google_api_key = ENV['GOOGLE_API_KEY'] || ''

  Jekyll.logger.info "[DEBUG] GOOGLE_API_KEY env var exists: #{!ENV['GOOGLE_API_KEY'].nil?}"
  Jekyll.logger.info "[DEBUG] GOOGLE_API_KEY value length: #{google_api_key.length}"
  Jekyll.logger.info "[DEBUG] JEKYLL_ENV: #{ENV['JEKYLL_ENV']}"
  Jekyll.logger.info "[DEBUG] All env vars: #{ENV.keys.sort.join(', ')}"

  # Set it in the Jekyll config so it's available in templates as {{ site.google_api_key }}
  site.config['google_api_key'] = google_api_key

  if google_api_key.empty?
    Jekyll.logger.warn "⚠️  Google API Key not found. Set GOOGLE_API_KEY environment variable."
    Jekyll.logger.warn "[DEBUG] All env vars starting with G: #{ENV.select { |k,v| k.start_with?('G') }.keys.join(', ')}"
  else
    Jekyll.logger.info "✓ Google API Key loaded successfully"
    Jekyll.logger.info "[DEBUG] API Key starts with: #{google_api_key[0..10]}..."
    Jekyll.logger.info "[DEBUG] API Key ends with: ...#{google_api_key[-10..-1]}"
  end
end
