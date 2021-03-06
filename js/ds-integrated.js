// start registering ds integrated features
$(function() {
  var ds;
  
  /**
   * Initialize the ds-integrated structure and load up the regions
   */
  function initializeDSIntegrated() {
    var $applicationControl = $([
      '<div class="ds-i-app-control">',
      ' <span class="glyphicon glyphicon-move"></span>',
      ' <span class="glyphicon glyphicon-remove"></span>',
      '</div>',
    ].join(''));

    var $container = $([
      '<div class="ds-integrated">',
      ' <div class="ds-i-region"></div>',
      '</div>'
    ].join(''));

    var $regionContainer = $container.find('.ds-i-region');
    var $throughList = $('#playthrough_list');

    // setup regions including id's and necessary elements
    var regions = $throughList.children('h3').toArray().map(function(region) {
      return {
        id: region.id,
        $header: $(region),
        $list: $(region).next(),
        $todos: $(region).next().children(),
        $startButton: $('<button type="button" class="btn btn-primary ds-i-start">Start tracking</button>')
      };
    });

    // bind region interactions
    regions.forEach(function(region) {
      region.$header.append(region.$startButton);

      region.$startButton.click(function() {
        startRegion(region);
      });
    });

    // setup electron
    var electron = require("electron");
    var screenSize = electron.screen.getPrimaryDisplay().workAreaSize;

    ds = {
      $throughList: $throughList,
      regions: regions,
      $container: $container,
      $applicationControl: $applicationControl,
      $regionContainer: $regionContainer,
      $body: $('body'),
      electron: electron,
      screenSize: screenSize,
      eWindow: electron.remote.getCurrentWindow()
    };

    ds.$body.append(ds.$container);

    ds.$body.addClass('ds-i');

    $applicationControl.insertBefore($(ds.$body.children()[0]));
    $applicationControl.find('span').click(function () {
      ds.eWindow.close();
    });

    // restore latest state
    var profile = getProfile();

    if (profile.dsIActive) {
      ds.regions.forEach(function(region) {
        if (region.id === profile.dsIActive) {
          startRegion(region);
        }
      });
    } else {
      ds.eWindow.show();
    }
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
    // save active region to profile
    var profile = getProfile();
    profile.dsIActive = region.id;

    $.jStorage.set(window.profilesKey, window.profiles);

    // transforming browser using electron
    // safe before state
    ds.beforeBounds = ds.eWindow.getBounds();

    // move to top right corner
    ds.eWindow.setBounds({
      x: ds.screenSize.width - 300,
      y: 0,
      width: 300,
      height: 400,
    });
    
    ds.$container.css('height', '400px');

    // set electron window options
    ds.eWindow.setAlwaysOnTop(true);
    ds.eWindow.setMovable(false);
    ds.eWindow.setResizable(false);
    
    ds.$container.css('height', '400px');

    // setup normal browser stuff
    ds.activeRegion = region;

    // clone original region to our container
    ds.$regionContainer.html('');
    ds.$regionContainer.append(region.$header.clone());
    ds.$regionContainer.append(region.$list.clone());

    // prepend controls
    var $regionHeader = ds.$regionContainer.find('h3');
    var $prevRegion = $('<button class="ds-i-prev"><span class="glyphicon glyphicon-chevron-left"></span></button>');
    var $nextRegion = $('<button class="ds-i-next"><span class="glyphicon glyphicon-chevron-right"></span></button>');
    var $closeRegion = $('<button class="ds-i-close"><span class="glyphicon glyphicon-remove"></span></button>');

    $regionHeader.prepend($nextRegion);
    $nextRegion.click(nextRegion);
    
    $regionHeader.prepend($prevRegion);
    $prevRegion.click(prevRegion);
    
    $regionHeader.append($closeRegion);
    $closeRegion.click(closeRegion);

    // remove html without tags
    $regionHeader.contents().filter(function () {
      return this.nodeType === 3;
    }).remove();

    // add count to list elements
    var labelContents = ds.$regionContainer.find('ul li label .item_content').toArray();
    var labelContentCount = labelContents.length;
    
    for (var i = 0; i < labelContents.length; i++) {
      $(labelContents[i]).html(((i + 1) + ' / ' + labelContentCount) + ' ' + $(labelContents[i]).html())
    }

    // add region counter
    $regionHeader.find('a').prepend(ds.regions.indexOf(region) + 1 + '. ');

    // bin list element clicks
    ds.$container.find('li').click(function($event) {
      // set cloned li active
      var $currInput = $($event.currentTarget).find('input');
      $currInput.prop('checked', true);
      
      // set origin li active
      var $originInput = $('#' + $($event.currentTarget).attr('data-id'));
      $originInput.click();
      setTimeout(setActiveTodo);

      $event.preventDefault();
      $event.stopPropagation();
      return false;
    });

    // set active todo
    setActiveTodo();

    // activate ds-integrated
    ds.$body.addClass('ds-i-active');
    ds.$body.scrollTop(0);

    ds.eWindow.show();
  }

  /**
   * Search for unresolved todos and add specific classes
   */
  function setActiveTodo() {
    var allTodos = ds.$container.find('input[type="checkbox"]').toArray();
    var needToSolve = ds.$container.find('input[type="checkbox"]:not(:checked)').toArray();

    // resets
    allTodos.forEach(function(input) {
      var $listElement = $(input).closest('li');

      $listElement.removeClass('ds-i-side-todo');
      $listElement.removeClass('ds-i-active-todo');
    });

    // add active classes
    if (needToSolve.length > 0) {
      var $activeTodo = $(needToSolve[0]).closest('li');

      $activeTodo.next().addClass('ds-i-side-todo');
      $activeTodo.addClass('ds-i-active-todo');

      setTimeout(function() {
        ds.$container.animate({
          scrollTop: ds.$container.scrollTop() + $activeTodo.offset().top - 40
        });
      }, 500);
    }
  }

  /**
   * Removes data from regionContainer and makes everthying else visible 
   */
  function closeRegion() {
    // restore electron before
    ds.eWindow.setBounds(ds.beforeBounds);
    ds.eWindow.setAlwaysOnTop(false);
    ds.eWindow.setMenuBarVisibility(true);
    ds.eWindow.setMovable(true);
    ds.eWindow.setResizable(true);
    ds.eWindow.setOpacity(1);

    // remove active region from profile
    var profile = getProfile();
    delete profile.dsIActive;

    $.jStorage.set(window.profilesKey, window.profiles);

    // restore electron before
    ds.electron.ipcRenderer.send('show-ds-i');

    delete ds.beforeBounds;
    delete ds.activeRegion;

    ds.$body.removeClass('ds-i-active');
    ds.$body.addClass('transparent');
  }
  
  /**
   * Jump to next region tracking
   */
  function nextRegion() {
    if (ds.activeRegion) {
      var regionIndex = ds.regions.indexOf(ds.activeRegion);

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
  function prevRegion() {
    if (ds.activeRegion) {
      var regionIndex = ds.regions.indexOf(ds.activeRegion);

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
