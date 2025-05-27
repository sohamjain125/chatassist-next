-- Drop all foreign key constraints first
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) 
    + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;
EXEC sp_executesql @sql;

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
    Address NVARCHAR(200) NOT NULL,
    Latitude FLOAT,
    Longitude FLOAT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create PropertyDetail table
CREATE TABLE PropertyDetail (
    PropertyDetailId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    Description NVARCHAR(MAX),
    PropertyNo NVARCHAR(50),
    Property_ID NVARCHAR(50),
    StreetNumber NVARCHAR(50),
    StreetName NVARCHAR(100),
    Suburb NVARCHAR(100),
    State NVARCHAR(10),
    Postcode NVARCHAR(10),
    PropertyType NVARCHAR(50),
    Address NVARCHAR(200),
    LandOwnershipType NVARCHAR(50),
    CrownAllotmentNo NVARCHAR(50),
    SectionNo NVARCHAR(50),
    ParishName NVARCHAR(100),
    MunicipalDistrict NVARCHAR(100),
    LP_PS NVARCHAR(50),
    PlanNo NVARCHAR(50),
    Volume NVARCHAR(50),
    Folio NVARCHAR(50),
    AreaOfNewBuildingWork NVARCHAR(50),
    Termites NVARCHAR(50),
    FloodProne NVARCHAR(50),
    BushfireProne NVARCHAR(50),
    DesignatedLand NVARCHAR(50),
    AlpineArea NVARCHAR(50),
    DeclaredRoad NVARCHAR(50),
    Country NVARCHAR(50),
    AllotmentArea FLOAT,
    LotNo NVARCHAR(50),
    PlanningPermitNo NVARCHAR(50),
    PlanningPermitDate NVARCHAR(50),
    MelwayRef NVARCHAR(50),
    BushfireAttackLevel NVARCHAR(50),
    Locality NVARCHAR(100),
    County NVARCHAR(100),
    Zonning NVARCHAR(50),
    SmallLot NVARCHAR(50),
    SiteSlope NVARCHAR(50),
    Precinct NVARCHAR(100),
    GFA NVARCHAR(50),
    SiteCover NVARCHAR(50),
    SiteDimensionLength NVARCHAR(50),
    Ward NVARCHAR(50),
    Storeys NVARCHAR(50),
    SiteDimensionWidth NVARCHAR(50),
    NeighbourhoodPlan NVARCHAR(100),
    ReferralTriggers NVARCHAR(MAX),
    SnowFall NVARCHAR(50),
    SeweredArea NVARCHAR(50),
    StormwaterDischargePoint NVARCHAR(50),
    UncontrolledOverlandDrainage NVARCHAR(50),
    Proposed NVARCHAR(50),
    ExistingDwelling NVARCHAR(50),
    UnitNumber NVARCHAR(50),
    DetachedStatus NVARCHAR(50),
    StandardParcelIdentifier NVARCHAR(50),
    ShopNo NVARCHAR(50),
    Longitude FLOAT,
    Latitude FLOAT,
    ExistingUse NVARCHAR(50),
    PropertyCode NVARCHAR(50),
    StreetNumber2 NVARCHAR(50),
    StreetType NVARCHAR(50),
    ComplexUnitType NVARCHAR(50),
    ComplexLevelType NVARCHAR(50),
    ComplexLevelNumber NVARCHAR(50),
    ComplexUnitIdentifier NVARCHAR(50),
    WKID NVARCHAR(50),
    CadastralID NVARCHAR(50),
    LotType NVARCHAR(50),
    StreetSuffix NVARCHAR(50),
    GurasID NVARCHAR(50),
    PropertySize NVARCHAR(50),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId)
);

-- Create Zone table
CREATE TABLE Zone (
    ZoneId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    PropertyDetailId INT NOT NULL,
    ZoneCode NVARCHAR(50),
    ZoneDescription NVARCHAR(MAX),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId),
    FOREIGN KEY (PropertyDetailId) REFERENCES PropertyDetail(PropertyDetailId)
);

-- Create Overlay table
CREATE TABLE Overlay (
    OverlayId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    PropertyDetailId INT NOT NULL,
    OverlayCode NVARCHAR(50),
    OverlayDescription NVARCHAR(MAX),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId),
    FOREIGN KEY (PropertyDetailId) REFERENCES PropertyDetail(PropertyDetailId)
);

-- Create ChatSession table
CREATE TABLE ChatSession (
    ChatSessionId INT IDENTITY(1,1) PRIMARY KEY,
    SearchId INT NOT NULL,
    LexSessionId NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SearchId) REFERENCES Search(SearchId)
);

-- Create ChatMessage table
CREATE TABLE ChatMessage (
    ChatMessageId INT IDENTITY(1,1) PRIMARY KEY,
    ChatSessionId INT NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Sender NVARCHAR(50) NOT NULL,
    Timestamp DATETIME NOT NULL,
    ResponseCard NVARCHAR(MAX),
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