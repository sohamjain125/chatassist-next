import { NextResponse } from 'next/server';
import { sql, getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { formatInTimeZone } from 'date-fns-tz';
import { encodeIds, encodePropertyId, encodeSearchId } from '@/lib/hash';

const TIMEZONE = 'Australia/Melbourne';

export async function POST(req: Request) {
  let transaction;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    let { propertyData, zones, overlays } = await req.json();
    zones = Array.isArray(zones) ? zones : [];
    overlays = Array.isArray(overlays) ? overlays : [];

    // Get database connection
    const pool = await getConnection();

    // Start a transaction
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Helper function to handle null values
    const getValue = (value: any) => value === null || value === undefined ? null : value;

    // Get current UTC timestamp
    const utcNow = new Date(formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));

    // First, insert into Search table and get the generated SearchId
    const searchResult = await transaction.request()
      .input('UserId', sql.Int, user.UserId)
      .input('Latitude', sql.Float, getValue(propertyData.Latitude))
      .input('Longitude', sql.Float, getValue(propertyData.Longitude))
      .input('CreatedAt', sql.DateTime, utcNow)
      .input('UpdatedAt', sql.DateTime, utcNow)
      .query(`
        INSERT INTO Search (
          UserId,
          Latitude,
          Longitude,
          CreatedAt,
          UpdatedAt
        )
        OUTPUT INSERTED.SearchId
        VALUES (
          @UserId,
          @Latitude,
          @Longitude,
          @CreatedAt,
          @UpdatedAt
        )
      `);

    const searchId = searchResult.recordset[0].SearchId;

    // Insert into PropertyDetail and get the generated PropertyDetailId
    const propertyDetailResult = await transaction.request()
      .input('SearchId', sql.Int, searchId)
      .input('Description', sql.VarChar, getValue(propertyData.Description))
      .input('PropertyNo', sql.VarChar, getValue(propertyData.PropertyNo))
      .input('StreetNumber', sql.VarChar, getValue(propertyData.StreetNumber))
      .input('StreetName', sql.VarChar, getValue(propertyData.StreetName))
      .input('Suburb', sql.VarChar, getValue(propertyData.Suburb))
      .input('State', sql.VarChar, getValue(propertyData.State))
      .input('Postcode', sql.VarChar, getValue(propertyData.Postcode))
      .input('PropertyType', sql.VarChar, getValue(propertyData.PropertyType))
      .input('Address', sql.VarChar, getValue(propertyData.Address))
      .input('LandOwnershipType', sql.VarChar, getValue(propertyData.LandOwnershipType))
      .input('CrownAllotmentNo', sql.VarChar, getValue(propertyData.CrownAllotmentNo))
      .input('SectionNo', sql.VarChar, getValue(propertyData.SectionNo))
      .input('ParishName', sql.VarChar, getValue(propertyData.ParishName))
      .input('MunicipalDistrict', sql.VarChar, getValue(propertyData.MunicipalDistrict))
      .input('LP_PS', sql.VarChar, getValue(propertyData.LP_PS))
      .input('PlanNo', sql.VarChar, getValue(propertyData.PlanNo))
      .input('Volume', sql.VarChar, getValue(propertyData.Volume))
      .input('Folio', sql.VarChar, getValue(propertyData.Folio))
      .input('AreaOfNewBuildingWork', sql.VarChar, getValue(propertyData.AreaOfNewBuildingWork))
      .input('Termites', sql.VarChar, getValue(propertyData.Termites))
      .input('FloodProne', sql.VarChar, getValue(propertyData.FloodProne))
      .input('BushfireProne', sql.VarChar, getValue(propertyData.BushfireProne))
      .input('DesignatedLand', sql.VarChar, getValue(propertyData.DesignatedLand))
      .input('AlpineArea', sql.VarChar, getValue(propertyData.AlpineArea))
      .input('DeclaredRoad', sql.VarChar, getValue(propertyData.DeclaredRoad))
      .input('Country', sql.VarChar, getValue(propertyData.Country))
      .input('AllotmentArea', sql.Float, getValue(propertyData.AllotmentArea))
      .input('LotNo', sql.VarChar, getValue(propertyData.LotNo))
      .input('PlanningPermitNo', sql.VarChar, getValue(propertyData.PlanningPermitNo))
      .input('PlanningPermitDate', sql.VarChar, getValue(propertyData.PlanningPermitDate))
      .input('MelwayRef', sql.VarChar, getValue(propertyData.MelwayRef))
      .input('BushfireAttackLevel', sql.VarChar, getValue(propertyData.BushfireAttackLevel))
      .input('Locality', sql.VarChar, getValue(propertyData.Locality))
      .input('County', sql.VarChar, getValue(propertyData.County))
      .input('Zonning', sql.VarChar, getValue(propertyData.Zonning))
      .input('SmallLot', sql.VarChar, getValue(propertyData.SmallLot))
      .input('SiteSlope', sql.VarChar, getValue(propertyData.SiteSlope))
      .input('Precinct', sql.VarChar, getValue(propertyData.Precinct))
      .input('GFA', sql.VarChar, getValue(propertyData.GFA))
      .input('SiteCover', sql.VarChar, getValue(propertyData.SiteCover))
      .input('SiteDimensionLength', sql.VarChar, getValue(propertyData.SiteDimensionLength))
      .input('Ward', sql.VarChar, getValue(propertyData.Ward))
      .input('Storeys', sql.VarChar, getValue(propertyData.Storeys))
      .input('SiteDimensionWidth', sql.VarChar, getValue(propertyData.SiteDimensionWidth))
      .input('NeighbourhoodPlan', sql.VarChar, getValue(propertyData.NeighbourhoodPlan))
      .input('ReferralTriggers', sql.VarChar, getValue(propertyData.ReferralTriggers))
      .input('SnowFall', sql.VarChar, getValue(propertyData.SnowFall))
      .input('SeweredArea', sql.VarChar, getValue(propertyData.SeweredArea))
      .input('StormwaterDischargePoint', sql.VarChar, getValue(propertyData.StormwaterDischargePoint))
      .input('UncontrolledOverlandDrainage', sql.VarChar, getValue(propertyData.UncontrolledOverlandDrainage))
      .input('Proposed', sql.VarChar, getValue(propertyData.Proposed))
      .input('ExistingDwelling', sql.VarChar, getValue(propertyData.ExistingDwelling))
      .input('UnitNumber', sql.VarChar, getValue(propertyData.UnitNumber))
      .input('DetachedStatus', sql.VarChar, getValue(propertyData.DetachedStatus))
      .input('StandardParcelIdentifier', sql.VarChar, getValue(propertyData.StandardParcelIdentifier))
      .input('StandardPropertyIdentifier', sql.VarChar, getValue(propertyData.StandardPropertyIdentifier))
      .input('ShopNo', sql.VarChar, getValue(propertyData.ShopNo))
      .input('Longitude', sql.Float, getValue(propertyData.Longitude))
      .input('Latitude', sql.Float, getValue(propertyData.Latitude))
      .input('ExistingUse', sql.VarChar, getValue(propertyData.ExistingUse))
      .input('PropertyCode', sql.VarChar, getValue(propertyData.PropertyCode))
      .input('StreetNumber2', sql.VarChar, getValue(propertyData.StreetNumber2))
      .input('StreetType', sql.VarChar, getValue(propertyData.StreetType))
      .input('ComplexUnitType', sql.VarChar, getValue(propertyData.ComplexUnitType))
      .input('ComplexLevelType', sql.VarChar, getValue(propertyData.ComplexLevelType))
      .input('ComplexLevelNumber', sql.VarChar, getValue(propertyData.ComplexLevelNumber))
      .input('ComplexUnitIdentifier', sql.VarChar, getValue(propertyData.ComplexUnitIdentifier))
      .input('WKID', sql.VarChar, getValue(propertyData.WKID))
      .input('CadastralID', sql.VarChar, getValue(propertyData.CadastralID))
      .input('LotType', sql.VarChar, getValue(propertyData.LotType))
      .input('StreetSuffix', sql.VarChar, getValue(propertyData.StreetSuffix))
      .input('GurasID', sql.VarChar, getValue(propertyData.GurasID))
      .input('PropertySize', sql.VarChar, getValue(propertyData.PropertySize))
      .query(`
        INSERT INTO PropertyDetail (
          SearchId,
          Description,
          PropertyNo,
          StreetNumber,
          StreetName,
          Suburb,
          State,
          Postcode,
          PropertyType,
          Address,
          LandOwnershipType,
          CrownAllotmentNo,
          SectionNo,
          ParishName,
          MunicipalDistrict,
          LP_PS,
          PlanNo,
          Volume,
          Folio,
          AreaOfNewBuildingWork,
          Termites,
          FloodProne,
          BushfireProne,
          DesignatedLand,
          AlpineArea,
          DeclaredRoad,
          Country,
          AllotmentArea,
          LotNo,
          PlanningPermitNo,
          PlanningPermitDate,
          MelwayRef,
          BushfireAttackLevel,
          Locality,
          County,
          Zonning,
          SmallLot,
          SiteSlope,
          Precinct,
          GFA,
          SiteCover,
          SiteDimensionLength,
          Ward,
          Storeys,
          SiteDimensionWidth,
          NeighbourhoodPlan,
          ReferralTriggers,
          SnowFall,
          SeweredArea,
          StormwaterDischargePoint,
          UncontrolledOverlandDrainage,
          Proposed,
          ExistingDwelling,
          UnitNumber,
          DetachedStatus,
          StandardParcelIdentifier,
          StandardPropertyIdentifier,
          ShopNo,
          Longitude,
          Latitude,
          ExistingUse,
          PropertyCode,
          StreetNumber2,
          StreetType,
          ComplexUnitType,
          ComplexLevelType,
          ComplexLevelNumber,
          ComplexUnitIdentifier,
          WKID,
          CadastralID,
          LotType,
          StreetSuffix,
          GurasID,
          PropertySize
        )
        OUTPUT INSERTED.PropertyDetailId
        VALUES (
          @SearchId,
          @Description,
          @PropertyNo,
          @StreetNumber,
          @StreetName,
          @Suburb,
          @State,
          @Postcode,
          @PropertyType,
          @Address,
          @LandOwnershipType,
          @CrownAllotmentNo,
          @SectionNo,
          @ParishName,
          @MunicipalDistrict,
          @LP_PS,
          @PlanNo,
          @Volume,
          @Folio,
          @AreaOfNewBuildingWork,
          @Termites,
          @FloodProne,
          @BushfireProne,
          @DesignatedLand,
          @AlpineArea,
          @DeclaredRoad,
          @Country,
          @AllotmentArea,
          @LotNo,
          @PlanningPermitNo,
          @PlanningPermitDate,
          @MelwayRef,
          @BushfireAttackLevel,
          @Locality,
          @County,
          @Zonning,
          @SmallLot,
          @SiteSlope,
          @Precinct,
          @GFA,
          @SiteCover,
          @SiteDimensionLength,
          @Ward,
          @Storeys,
          @SiteDimensionWidth,
          @NeighbourhoodPlan,
          @ReferralTriggers,
          @SnowFall,
          @SeweredArea,
          @StormwaterDischargePoint,
          @UncontrolledOverlandDrainage,
          @Proposed,
          @ExistingDwelling,
          @UnitNumber,
          @DetachedStatus,
          @StandardParcelIdentifier,
          @StandardPropertyIdentifier,
          @ShopNo,
          @Longitude,
          @Latitude,
          @ExistingUse,
          @PropertyCode,
          @StreetNumber2,
          @StreetType,
          @ComplexUnitType,
          @ComplexLevelType,
          @ComplexLevelNumber,
          @ComplexUnitIdentifier,
          @WKID,
          @CadastralID,
          @LotType,
          @StreetSuffix,
          @GurasID,
          @PropertySize
        )
      `);

    const propertyDetailId = propertyDetailResult.recordset[0].PropertyDetailId;

    // Insert zones
    if (zones && zones.length > 0) {
      for (const zone of zones) {
        await transaction.request()
          .input('SearchId', sql.Int, searchId)
          .input('PropertyDetailId', sql.Int, propertyDetailId)
          .input('AssessmentNumber', sql.Int, getValue(zone.AssessmentNumber))
          .input('ZoneDescription', sql.VarChar, getValue(zone.ZoneDescription))
          .input('PropertyDescription', sql.VarChar, getValue(zone.PropertyDescription))
          .input('Zonning', sql.VarChar, getValue(zone.Zonning))
          .input('ZoneCode', sql.VarChar, getValue(zone.ZoneCode))
          .input('LGA', sql.VarChar, getValue(zone.LGA))
          .query(`
            INSERT INTO Zone (
              SearchId,
              PropertyDetailId,
              AssessmentNumber,
              ZoneDescription,
              PropertyDescription,
              Zonning,
              ZoneCode,
              LGA
            )
            VALUES (
              @SearchId,
              @PropertyDetailId,
              @AssessmentNumber,
              @ZoneDescription,
              @PropertyDescription,
              @Zonning,
              @ZoneCode,
              @LGA
            )
          `);
      }
    }

    // Insert overlays
    if (overlays && overlays.length > 0) {
      for (const overlay of overlays) {
        await transaction.request()
        .input('SearchId', sql.Int, searchId)
          .input('PropertyDetailId', sql.Int, propertyDetailId)
          .input('AssessmentNumber', sql.Int, getValue(overlay.AssessmentNumber))
          .input('OverlayDescription', sql.VarChar, getValue(overlay.OverlayDescription))
          .input('PropertyDescription', sql.VarChar, getValue(overlay.PropertyDescription))
          .input('Zonning', sql.VarChar, getValue(overlay.Zonning))
          .input('OverlayCode', sql.VarChar, getValue(overlay.OverlayCode))
          .input('LGA', sql.VarChar, getValue(overlay.LGA))
          .query(`
            INSERT INTO Overlay (
              SearchId,
              PropertyDetailId,
              AssessmentNumber,
              OverlayDescription,
              PropertyDescription,
              Zonning,
              OverlayCode,
              LGA
            )
            VALUES (
              @SearchId,
              @PropertyDetailId,
              @AssessmentNumber,
              @OverlayDescription,
              @PropertyDescription,
              @Zonning,
              @OverlayCode,
              @LGA
            )
          `);
      }
    }

    // Commit the transaction
    await transaction.commit();

    return NextResponse.json({ 
      success: true, 
      hash:encodeIds(searchId, propertyDetailId)
    });
  } catch (error) {
    console.error('Error saving search:', error);
    // Only attempt rollback if transaction exists and hasn't been committed
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    return NextResponse.json(
      { success: false, error: 'Failed to save search' },
      { status: 500 }
    );
  }
} 