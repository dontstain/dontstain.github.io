ymaps.ready(init);

function init(){
  const myMap = new ymaps.Map("map", {
    center: [54.61, 45.05],
    zoom: 5,
    controls: ['zoomControl']
  });

  const MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
    '<div class="map-mark">' +
    '<a class="link map-mark__close-button" href="#">&times;</a>' +
    '<div class="map-mark__arrow"></div>' +
    '<div class="map-mark__inner">' +
    '$[[options.contentLayout observeSize minWidth=235 maxWidth=276 maxHeight=300 overflow: hidden]]' +
    '</div>' +
    '</div>', {
      build: function () {
        this.constructor.superclass.build.call(this);

        this._$element = $('.map-mark', this.getParentElement());

        this.applyElementOffset();

        this._$element.find('.map-mark__close-button')
          .on('click', $.proxy(this.onCloseClick, this));
      },

      clear: function () {
        this._$element.find('.map-mark__close-button')
          .off('click');

        this.constructor.superclass.clear.call(this);
      },

      onSublayoutSizeChange: function () {
        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

        if(!this._isElement(this._$element)) {
            return;
        }

        this.applyElementOffset();

        this.events.fire('shapechange');
      },

      applyElementOffset: function () {
        this._$element.css({
          left: -(this._$element[0].offsetWidth / 2),
          top: -(this._$element[0].offsetHeight + this._$element.find('.map-mark__arrow')[0].offsetHeight)
        });
      },

      onCloseClick: function (e) {
        e.preventDefault();

        this.events.fire('userclose');
      },

      getShape: function () {
        if(!this._isElement(this._$element)) {
          return MyBalloonLayout.superclass.getShape.call(this);
        }

        var position = this._$element.position();

        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
          [position.left, position.top], [
            position.left + this._$element[0].offsetWidth,
            position.top + this._$element[0].offsetHeight + this._$element.find('.map-mark__arrow')[0].offsetHeight
          ]
        ]));
      },

    _isElement: function (element) {
        return element && element[0] && element.find('.map-mark__arrow')[0];
    }
  })

  const MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
    '<div class="map-mark__content">$[properties.balloonContent]</div>'
  );

  const MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
    '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
  );

  function placemark(story) {
    myPlacemark = new ymaps.Placemark(Array.from(story.coordinates.split(', ')), {
      balloonContentHeader: '12',
      balloonContent: 
      `
      <a href=${story.link} class="link map-mark__link">
        <img src="${story.image}" alt="Фото" class="map-mark__image">
        <div class="map-mark__info">
          <span class=map-mark__region>${story.region}</span>
          <h2 class="map-mark__name">${story.name}</h2>
          <p class="map-mark__text">${story.text}</p>
        </div>
      </a>
      `
    }, {
      balloonShadow: false,
      balloonLayout: MyBalloonLayout,
      balloonContentLayout: MyBalloonContentLayout,
      balloonPanelMaxMapArea: 0,
      hideIconOnBalloonOpen: false,
      balloonOffset: [3, 10],
      iconLayout: 'default#image',
      iconImageHref: './images/mark.svg',
      iconImageSize: [22, 24],
      iconImageOffset: [0, 0],
      iconContentOffset: [15, 15],
      iconContentLayout: MyIconContentLayout
    });
    
    myMap.geoObjects.add(myPlacemark);
  }
  
  stories.forEach(story => placemark(story));

}


const wWidth = $(window).width();

document.addEventListener('click', function (e) {
  const navPanel = document.querySelector('.navigation');

  if (e.target.classList.contains('header__menu')) {
    navPanel.setAttribute('style','display: block');
  };
  if (e.target.classList.contains('navigation__close-button')) {
    navPanel.removeAttribute('style');
  };
  if (wWidth <= 768 && (e.target.classList.contains('navigation__item') || e.target.classList.contains('navigation__text'))) {
    const dropdown = e.target.classList.contains('navigation__item') ? e.target.querySelector('.navigation__dropdown') : e.target.parentElement.querySelector('.navigation__dropdown');
  
    dropdown.classList.toggle('block_visible');
  }
})

document.addEventListener('mouseover', function(e) {
  if (wWidth > 768) {
    const dropdown = e.target.querySelector('.navigation__dropdown');
    
    if (e.target.classList.contains('navigation__item')) {
      dropdown.classList.add('block_visible');
    } 
    else if (document.querySelector('.navigation__dropdown.block_visible') && !(e.target.classList.contains('navigation__text') || e.target.classList.contains('navigation__arrow') || e.target.classList.contains('navigation__dropdown-item'))) {
      const openedDd = document.querySelector('.navigation__dropdown.block_visible');
      
      openedDd.classList.remove('block_visible');
    }
  }
});