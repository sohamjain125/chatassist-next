export interface PropertyData {
    Description: string;
    Assessment_Number: string;
    Property_ID: string;
    StreetNumber: string;
    StreetName: string;
    Suburb: string;
    State: string;
    Postcode: string;
    PropertyType: string;
    Address: string;
    LandOwnershipType: string;
    CrownAllotmentNo: string;
    SectionNo: string;
    ParishName: string;
    MunicipalDistrict: string;
    LP_PS: string;
    PlanNo: string;
    Volume: string;
    Folio: string;
    AreaOfNewBuildingWork: string;
    Termites: string;
    FloodProne: string;
    BushfireProne: string;
    DesignatedLand: string;
    AlpineArea: string;
    DeclaredRoad: string;
    Country: string;
    AllotmentArea: number;
    LotNo: string;
    PlanningPermitNo: string;
    PlanningPermitDate: string;
    MelwayRef: string;
    BushfireAttackLevel: string;
    Locality: string;
    County: string;
    Zonning: string;
    SmallLot: string;
    SiteSlope: string;
    Precinct: string;
    GFA: string;
    SiteCover: string;
    SiteDimensionLength: string;
    Ward: string;
    Storeys: string;
    SiteDimensionWidth: string;
    NeighbourhoodPlan: string;
    ReferralTriggers: string;
    PropertyNo: string;
    SnowFall: string;
    SeweredArea: string;
    StormwaterDischargePoint: string;
    UncontrolledOverlandDrainage: string;
    Proposed: string;
    ExistingDwelling: string;
    UnitNumber: string;
    DetachedStatus: string;
    StandardParcelIdentifier: string;
    ShopNo: string;
    Longitude: number;
    Latitude: number;
    ExistingUse: string;
    PropertyCode: string;
    StreetNumber2: string;
    StreetType: string;
    ComplexUnitType: string;
    ComplexLevelType: string;
    ComplexLevelNumber: string;
    ComplexUnitIdentifier: string;
    WKID: string;
    CadastralID: string;
    LotType: string;
    StreetSuffix: string;
    GurasID: string;
    PropertySize: string;
    // Optionally, add any extra fields you use in your app:
    location?: { lat: number; lng: number };
    buildingOutline?: any;
    timestamp?: string;
  }


  export interface Zone {
    SchemeCode: string;
    LGA: string;
    ZoneNum: number;
    ZoneCode: string;
    ZoneDescription: string;
    GazetteDate: string | null;
    SourceType: string;
  }
  
  export interface Overlay {
    SchemeCode: string;
    LGA: string;
    OverlayNum: number;
    OverlayCode: string;
    OverlayDescription: string;
    GazetteDate: string | null;
    SourceType: string;
  }