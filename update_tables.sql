-- Drop all foreign key constraints first using VARCHAR and EXEC()
DECLARE @sql VARCHAR(MAX) = '';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) 
    + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;

EXEC(@sql);

-- Drop existing tables if they exist (in correct order to handle foreign key constraints)
IF OBJECT_ID('ChatMessage', 'U') IS NOT NULL DROP TABLE ChatMessage;
IF OBJECT_ID('ChatSession', 'U') IS NOT NULL DROP TABLE ChatSession;
IF OBJECT_ID('Overlay', 'U') IS NOT NULL DROP TABLE Overlay;
IF OBJECT_ID('Zone', 'U') IS NOT NULL DROP TABLE Zone;
IF OBJECT_ID('PropertyDetail', 'U') IS NOT NULL DROP TABLE PropertyDetail;
IF OBJECT_ID('Search', 'U') IS NOT NULL DROP TABLE Search;

-- Create Search table
CREATE TABLE Search (
    SearchId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Address VARCHAR(200) NOT NULL,
    Latitude FLOAT,
    Longitude FLOAT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create PropertyDetail table
CREATE TABLE PropertyDetail (
    PropertyDetailId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    Description VARCHAR(MAX),
    PropertyNo VARCHAR(50),
    Property_ID VARCHAR(50),
    StreetNumber VARCHAR(50),
    StreetName VARCHAR(100),
    Suburb VARCHAR(100),
    State VARCHAR(10),
    Postcode VARCHAR(10),
    PropertyType VARCHAR(50),
    Address VARCHAR(200),
    LandOwnershipType VARCHAR(50),
    CrownAllotmentNo VARCHAR(50),
    SectionNo VARCHAR(50),
    ParishName VARCHAR(100),
    MunicipalDistrict VARCHAR(100),
    LP_PS VARCHAR(50),
    PlanNo VARCHAR(50),
    Volume VARCHAR(50),
    Folio VARCHAR(50),
    AreaOfNewBuildingWork VARCHAR(50),
    Termites VARCHAR(50),
    FloodProne VARCHAR(50),
    BushfireProne VARCHAR(50),
    DesignatedLand VARCHAR(50),
    AlpineArea VARCHAR(50),
    DeclaredRoad VARCHAR(50),
    Country VARCHAR(50),
    AllotmentArea FLOAT,
    LotNo VARCHAR(50),
    PlanningPermitNo VARCHAR(50),
    PlanningPermitDate VARCHAR(50),
    MelwayRef VARCHAR(50),
    BushfireAttackLevel VARCHAR(50),
    Locality VARCHAR(100),
    County VARCHAR(100),
    Zonning VARCHAR(50),
    SmallLot VARCHAR(50),
    SiteSlope VARCHAR(50),
    Precinct VARCHAR(100),
    GFA VARCHAR(50),
    SiteCover VARCHAR(50),
    SiteDimensionLength VARCHAR(50),
    Ward VARCHAR(50),
    Storeys VARCHAR(50),
    SiteDimensionWidth VARCHAR(50),
    NeighbourhoodPlan VARCHAR(100),
    ReferralTriggers VARCHAR(MAX),
    SnowFall VARCHAR(50),
    SeweredArea VARCHAR(50),
    StormwaterDischargePoint VARCHAR(50),
    UncontrolledOverlandDrainage VARCHAR(50),
    Proposed VARCHAR(50),
    ExistingDwelling VARCHAR(50),
    UnitNumber VARCHAR(50),
    DetachedStatus VARCHAR(50),
    StandardParcelIdentifier VARCHAR(50),
    ShopNo VARCHAR(50),
    Longitude FLOAT,
    Latitude FLOAT,
    ExistingUse VARCHAR(50),
    PropertyCode VARCHAR(50),
    StreetNumber2 VARCHAR(50),
    StreetType VARCHAR(50),
    ComplexUnitType VARCHAR(50),
    ComplexLevelType VARCHAR(50),
    ComplexLevelNumber VARCHAR(50),
    ComplexUnitIdentifier VARCHAR(50),
    WKID VARCHAR(50),
    CadastralID VARCHAR(50),
    LotType VARCHAR(50),
    StreetSuffix VARCHAR(50),
    GurasID VARCHAR(50),
    PropertySize VARCHAR(50),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId)
);

-- Create Zone table
CREATE TABLE Zone (
    ZoneId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    PropertyDetailId INT NOT NULL,
	AssessmentNumber INT,
	ZoneDescription VARCHAR(MAX),
	PropertyDescription VARCHAR(MAX),
	    Zonning VARCHAR(MAX),
    ZoneCode VARCHAR(50),
		LGA VARCHAR(MAX),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId),
    FOREIGN KEY (PropertyDetailId) REFERENCES PropertyDetail(PropertyDetailId)
);

-- Create Overlay table
CREATE TABLE Overlay (
    OverlayId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    PropertyDetailId INT NOT NULL,
	AssessmentNumber INT,
	OverlayDescription VARCHAR(MAX),
	PropertyDescription VARCHAR(MAX),
	Zonning VARCHAR(MAX),
    OverlayCode VARCHAR(50),
	LGA VARCHAR(MAX),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId),
    FOREIGN KEY (PropertyDetailId) REFERENCES PropertyDetail(PropertyDetailId)
);

-- Create ChatSession table
CREATE TABLE ChatSession (
    ChatSessionId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    LexSessionId VARCHAR(100) NOT NULL,
    Status VARCHAR(20) DEFAULT 'active', -- 'active' or 'ended'
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId)
);

-- Create ChatMessage table
CREATE TABLE ChatMessage (
    ChatMessageId INT IDENTITY(1,1) PRIMARY KEY,
    ChatSessionId INT NOT NULL,
    Content VARCHAR(MAX) NOT NULL,
    Sender VARCHAR(50) NOT NULL,
    Timestamp DATETIME NOT NULL,
    ResponseCard VARCHAR(MAX),
    FOREIGN KEY (ChatSessionId) REFERENCES ChatSession(ChatSessionId)
);

-- Create indexes for better performance
CREATE INDEX IX_Search_UserId ON Search(UserId);
CREATE INDEX IX_Search_CreatedAt ON Search(CreatedAt);
CREATE INDEX IX_PropertyDetail_SearchId ON PropertyDetail(SearchId);
CREATE INDEX IX_Zone_SearchId ON Zone(SearchId);
CREATE INDEX IX_Zone_PropertyDetailId ON Zone(PropertyDetailId);
CREATE INDEX IX_Overlay_SearchId ON Overlay(SearchId);
CREATE INDEX IX_Overlay_PropertyDetailId ON Overlay(PropertyDetailId);
CREATE INDEX IX_ChatSession_SearchId ON ChatSession(SearchId);
CREATE INDEX IX_ChatMessage_ChatSessionId ON ChatMessage(ChatSessionId);
CREATE INDEX IX_ChatMessage_Timestamp ON ChatMessage(Timestamp); 