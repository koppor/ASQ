(function ($) {
  $.fn.asqExpandSlide = function(slide, remove) {
    // If slide is boolean and remove is not defined,
    // We consider the signature to be fn(remove).
    if (typeof slide === 'boolean' &&
      (typeof remove === 'undefined' || remove === null)) {
      remove = slide;
      slide = '';
    }

    // Default value for slide if not set
    slide = slide || '';

    // Deafualt value for remove if not set
    if (remove !== true) {
      remove = false;
    }

    var $el
    if (slide === '') {
      $el = this;
    } else {
      $el = this.find(slide);
    }

    if ($el.attr('id') === undefined) { // The slides needs an id for this to work!
      return;
    }

    var self = this;
    // Remove an existing expand option from a slide
    if (remove) {
      // If removing a currently expanded slide, restore the content first.
      if (self.removeId && self.removeId === $el.attr('id')) {
        resetModal();
        hideModal();
      }
      // Remove expand button
      $el.find('.asq-slide-expand').fadeOut(200).remove();


    // Add extand option for a slide
    } else {
      // Check if there is a modal to put the slide content
      // If not this is the first the plugin is being called
      // We need to add the container and listeners
      if ($('#asq-slide-expanded-container').length === 0) {

        // Modal for expanded slides
        $(['<div id="asq-slide-expanded-container">',
           '<button id="asq-slide-reduce">',
           '<i class="glyphicon glyphicon-remove"></i></button>',
           '<div id="asq-slide-expanded"></div></div>'].join('')
          ).appendTo($('body')).hide();

        // Expand slide handler
        $(document).on('click', '.asq-slide-expand', function expand(evt) {
          var $slide = $(evt.target).closest('.step');

          resetModal();
          setModal($slide);
          showModal();
        });

        // Reduce slide handler
        $(document).on('click', '#asq-slide-reduce', function reduce(evt) {
          resetModal();
          hideModal();
        });

        document.addEventListener('impress:stepleave', function (evt) {
          resetModal();
          hideModal();
        });
      }

      $el.append('<button class="asq-slide-expand"><i class="glyphicon glyphicon-fullscreen"></i></button>');

    }

    function setModal($slide) {
      // Set content of modal from slide and display modal
      self.restoreId = $slide.attr('id');
      $('#asq-slide-expanded').html($slide.children(':not(.asq-slide-expand)'));
    }

    function resetModal() {
      // Restore existing content to slide from modal.
      if (self.restoreId) {
        $('#' + self.restoreId)
          .prepend($('#asq-slide-expanded').children());
      }
      self.restoreId = null;
      $('#asq-slide-expanded').html('');
    }

    function hideModal() {
      // Hide empty modal
      $('#asq-slide-expanded-container').fadeOut(200);
    }

    function showModal() {
      $('#asq-slide-expanded-container').fadeIn(200);
    }

  }
})(jQuery);