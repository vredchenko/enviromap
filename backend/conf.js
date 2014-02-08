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
     'Deforestation' 
    , 'Waste dump'
    , 'Illegal construction in protected area'
    , 'Water-related problems'
    , 'Wildfire'
    , 'Threats to biodiversity'
    , 'Poaching'
    , 'Other problem'
    ]
  , moderation: [
      'Approved'
    , 'Not approved yet'
    //, 'Rejeceted'
    //, 'Closed'
    ]
  , statuses:           [
      'New'
    , 'In progress'
    , 'Resolved'
    , 'Failed'
    ]
  , topSeverity:        5
  }
, lang: {
    // @todo
  }
};

exports.config = config;