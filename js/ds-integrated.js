// start registering ds integrated features
$(function() {
  var ds;
  
  /**
   * Initialize the ds-integrated structure and load up the regions
   */
  function initializeDSIntegrated() {
    var $container = $([
      '<div class="ds-integrated">',
      ' <div class="ds-i-region"><div>',
      ' <button class="ds-i-prev">prev<button>',
      ' <button class="ds-i-next">next<button>',
      ' <button class="ds-i-close">close<button>',
      '</div>'
    ].join());

    var $regionContainer = $container.find('.ds-i-region');
    var $nextRegion = $container.find('.ds-i-next');
    var $prevRegion = $container.find('.ds-i-prev');
    var $throughList = $('playthrough_list');

    $nextRegion.click(nextRegion);
    $prevRegion.click(prevtRegion);

    // setup regions including id's and necessary elements
    var regions = $throughList.children('h3').map(function(region) {
      return {
        id: region.id,
        $header: $(region),
        $list: $(region).next(),
        $todos: $list.children(),
        $startButton: $('<button class="ds-i-start">Start tracking</button>')
      };
    });

    // bind region interactions
    regions.forEach(function(region) {
      region.$header.append(region.$startButton);

      region.$startButton.click(function() {
        startRegion(region);
      });
    });

    ds = {
      $throughList: $throughList,
      regions: regions,
      $container: $container,
      $regionContainer: $regionContainer,
      $nextRegion: $nextRegion,
      $prevRegion: $prevRegion
    };

    $('body').append(ds.$container);
  }

  /**
   * return the current profile
   */
  function getProfile() {
    return window.profiles[profilesKey][profiles.current];
  }
  
  /**
   * Resize electron window, start ds-integrated view and clone elements to ds-integrated container
   */
  function startRegion(region) {
    ds.activeRegion = region

    $container.clear();
    $container.append(region.$header.clone());
    $container.append(region.$list.clone());
  }

  /**
   * Jump to next region tracking
   */
  function nextRegion() {
    if (ds.region) {
      var regionIndex = ds.regions.indexOf(ds.region);

      if (regionIndex !== ds.regions.length - 1) {
        startRegion(ds.regions[regionIndex + 1]);
      }
    } else {
      startRegion(ds.regions[0]);
    }
  }

  /**
   * Jump to previous region tracking
   */
  function nextRegion() {
    if (ds.region) {
      var regionIndex = ds.regions.indexOf(ds.region);

      if (regionIndex > 0) {
        startRegion(ds.regions[regionIndex - 1]);
      }
    } else {
      startRegion(ds.regions[0]);
    }
  }
  
  if (window.process && window.process.versions && window.process.versions.electron) {
    initializeDSIntegrated();
  }
})
