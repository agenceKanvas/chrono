jQuery(function($) {

  moment.locale('fr');
  var compareMilli = function (a, b) {
    if (a.milli < b.milli) return -1;
    if (a.milli > b.milli) return 1;
    return 0;
  }

  var now = new Date();
  var nowMilli = moment(now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear, 'DD/MM/YYYY').valueOf();

  $.ajax({
      url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRjJZ9d51pCdyRVahjuurSY2LbEhZnFU-93N4BAt_-Y4pysOcEw7dbMOOADbqSCvABCF4hegMEElK8c/pub?gid=592949326&single=true&output=tsv',
      success   : function(res){

          var data = d3_dsv.tsvParse(res, function(d, i) {
            var obj = {
              Date: d.Date,
              Time: moment(d.Date, 'DD MMMM YYYY'),
              Titre: d.Titre,
              Texte: d.Texte,
              Lien: d.Lien,
              Media: d.Media,
              Ville: d.Ville,
              Icone: d.Icone,
              open: false
            }
            if (i === 0) obj.Date2018 = moment(obj.Time.format('DD/MM') + '/2017', 'DD/MM/YYYY')
            else obj.Date2018 = moment(obj.Time.format('DD/MM') + '/2018', 'DD/MM/YYYY')
            obj.Milli = obj.Date2018.valueOf()
            return obj;
          });

          data = _.filter(data, function (o) { return o.Texte != '' && o.Milli <= nowMilli}).reverse();
          init(data);
      }
  });

  function init(data) {
    app = new Vue({
      el: '#app',
      data: {
        allArticles: data,
        articles: data.slice(0, 100),
        currentArticle: data[0],
        isCurrent: false,
        citys: _.uniq(data.map(d => d.Ville).filter(elt => elt)).sort(),
        currentCity: 'Toutes',
        rubriques: _.uniq(data.map(d => d.Rubrique).filter(elt => elt)).sort(),
        currentRubrique: 'Toutes rubriques',
        current: false,
        windowW: document.documentElement.clientWidth,
        isMobile: false,
        bottom: false
      },
      mounted: function() {

        var that = this;
        this.isMobile = this.windowW < 768 ? true : false;

        this.$nextTick(function() {

          var timelineBlocks = $('.timeline-block'),
            offset = 0.8;

          hideBlocks(timelineBlocks, offset);

          $(window).on('scroll', function(){
            (!window.requestAnimationFrame)
              ? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
              : window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
          });

          function hideBlocks(blocks, offset) {
            blocks.each(function(){
              ( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.timeline-img, .timeline-content').addClass('is-hidden');
            });
          }

          function showBlocks(blocks, offset) {
            blocks.each(function(){
              ( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.timeline-img').hasClass('is-hidden') ) && $(this).find('.timeline-img, .timeline-content').removeClass('is-hidden').addClass('bounce-in');
            });
          }
          window.addEventListener('scroll', _.debounce(function () {
            that.bottom = that.isBottom();
          }, 150));
          //this.addArticle();

          window.addEventListener('resize', _.debounce(this.resize, 150));
          this.resize()
        });

      },
      watch: {
        bottom: function (bottom) {
          if (bottom) {
            this.addArticle();
          }
        }
      },
      methods: {
        getVideoSrc : function (video) {
          var dataVideo = video.split('/')
          if (dataVideo[0] === 'ina') return 'https://player.ina.fr/player/embed/' + dataVideo[1] + '/1/1b0bd203fbcd702f9bc9b10ac3d0fc21/wide/0';
          else if (dataVideo[0] === 'youtube') return 'https://www.youtube.com/embed/' + dataVideo[1];
        },
        filteredArticles: function () {
          if (this.currentCity === 'Toutes' && this.currentRubrique === 'Toutes rubriques') return this.allArticles.slice(0, this.articles.length);
          else if (this.currentCity !== 'Toutes' && this.currentRubrique === 'Toutes rubriques') return _.filter(this.allArticles, {'Ville': this.currentCity}).slice(0, this.articles.length);
        },
        showContent: function (open) {
          if (!this.isMobile) return true
          else return open
        },
        addArticle: function () {
          var that = this;
          if (this.articles.length < this.allArticles.length) {
            var nextArticles = this.allArticles.slice(this.articles.length, this.articles.length + 100)
            nextArticles.forEach(function (v) {
              that.articles.push(v)
            })
          }
        },
        isBottom: function () {
          const scrollY = window.scrollY;
          const visible = document.documentElement.clientHeight;
          const pageHeight = document.documentElement.scrollHeight;
          const bottomOfPage = visible + scrollY >= pageHeight - 500;
          return bottomOfPage || pageHeight < visible;
        },
        resize: function() {
          var that = this;
          this.windowW = document.documentElement.clientWidth;
          this.isMobile = this.windowW < 768 ? true : false;
        }
      }

    });
  }

});
