# Cloudflare IP Updater
This application provides an easy means of dynamic DNS with Cloudflare.

To use it, simply specify these environment variables (.env file in the root of the package folder will work too!):

`CF_EMAIL` - Your Cloudflare email address\
`CF_KEY` - Your Cloudflare API key\
`CF_ZONE` - The root name of the zone (domain) are you targeting, e.g. google.com

And optionally, these ones:

`CF_RECORD_TYPE` - The type of the record you are targeting (A or CNAME, defaults to A)\
`CF_RECORD_NAME` - The name of the record you are targeting, excluding the zone name (defaults to @)\
`CF_UPDATE_INTERVAL` - How often the record should get updated, in ms (defaults to 1 hour)

Then, run `start.js` and keep it running. If a record is found that matches your environment variables, its content will be updated with your public IP address.
