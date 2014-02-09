/**
 * In configurable aspects of the app should be defined here:
 * 
 *  - database settings
 *  - data dictionaries (enumerations)
 *  - localization vocabularies
 */

var config = {
  db: {
    // @todo
  }
, dataTerms: {
    probTypes: [
      'Проблеми лісів' 
    , 'Сміттєзвалища'
    , 'Незаконна забудова'
    , 'Проблеми водойм'
    , 'Загрози біорізноманіттю'
    , 'Браконьєрство'
    , 'Інші проблеми'
    ]
  , moderation: [
      'Approved'
    , 'Not approved yet'
    //, 'Rejeceted'
    //, 'Closed'
    ]
  , statuses:           [
      'Нова'
    , 'В процесі'
    , 'Вирішена'
    ]
  , topSeverity:        5
  }
, lang: {
    // @todo
  }
};

exports.config = config;