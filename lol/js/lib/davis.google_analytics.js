/*!
 * Davis - googleAnalytics
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * Davis.googleAnalytics is a plugin to track Davis requests in google analytics.  It automatically
 * tracks every GET request and adds helpers to manually track other requests and to prevent a
 * particular request from being tracked.
 *
 * To include this plugin in your application first include a script tag for it and then in your
 * app do the following.
 *
 *    this.use(Davis.googleAnalytics)
 *
 * @plugin
 */
Davis.googleAnalytics = function () {

  /**
   * whether a route should be tracked or not
   * @private
   */
  var shouldTrack = true

  /**
   * bind to the apps routeComplete event and track the request unless explicitly told not to.
   * @private
   */
  this.bind('routeComplete', function (req) {
    if (shouldTrack && req.method == 'get') req.track()
    shouldTrack = true
  })

  this.helpers({
    /**
     * ## request.noTrack
     * Disable tracking for this request
     */
    noTrack: function () {
      shouldTrack = false
    },

    /**
     * ## request.track
     * Track this request in google analytics
     */
    track: function () {
      if (window.gtag) {
        var pagePath = this.path.replace(/^\/l\/[0-9]+/, "/l/0");
        window.gtag("event", "page_view", {
          page_path: pagePath,
          page_location: window.location.origin + pagePath,
        });
      }
      bbgmAds.cmd.push(function () {
        bbgmAds.refresh();
      });		  
	  
    }
  })
}