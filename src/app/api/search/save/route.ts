import { NextResponse } from 'next/server';
import { sql, getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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

    const { propertyData, zones, overlays } = await req.json();

    // Get database connection
    const pool = await getConnection();

    // Start a transaction
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Helper function to handle null values
    const getValue = (value: any) => value === null || value === undefined ? null : value;

    // First, insert into Search table and get the generated SearchId
    const searchResult = await transaction.request()
      .input('UserId', sql.Int, user.UserId)
      .input('Address', sql.NVarChar, propertyData.Address)
      .input('Latitude', sql.Float, getValue(propertyData.Latitude))
      .input('Longitude', sql.Float, getValue(propertyData.Longitude))
      .query(`
        INSERT INTO Search (
          UserId,
          Address,
          Latitude,
          Longitude
        )
        OUTPUT INSERTED.SearchId
        VALUES (
          @UserId,
          @Address,
          @Latitude,
          @Longitude
        )
      `);

    const searchId = searchResult.recordset[0].SearchId;

    // Insert into PropertyDetail and get the generated PropertyDetailId
    const propertyDetailResult = await transaction.request()
      .input('SearchId', sql.Int, searchId)
      .input('Description', sql.NVarChar, getValue(propertyData.Description))
      .input('PropertyNo', sql.NVarChar, getValue(propertyData.PropertyNo))
      .input('StreetNumber', sql.NVarChar, getValue(propertyData.StreetNumber))
      .input('StreetName', sql.NVarChar, getValue(propertyData.StreetName))
      .input('Suburb', sql.NVarChar, getValue(propertyData.Suburb))
      .input('State', sql.NVarChar, getValue(propertyData.State))
      .input('Postcode', sql.NVarChar, getValue(propertyData.Postcode))
      .input('PropertyType', sql.NVarChar, getValue(propertyData.PropertyType))
      .input('Address', sql.NVarChar, getValue(propertyData.Address))
      .input('LandOwnershipType', sql.NVarChar, getValue(propertyData.LandOwnershipType))
      .input('CrownAllotmentNo', sql.NVarChar, getValue(propertyData.CrownAllotmentNo))
      .input('SectionNo', sql.NVarChar, getValue(propertyData.SectionNo))
      .input('ParishName', sql.NVarChar, getValue(propertyData.ParishName))
      .input('MunicipalDistrict', sql.NVarChar, getValue(propertyData.MunicipalDistrict))
      .input('LP_PS', sql.NVarChar, getValue(propertyData.LP_PS))
      .input('PlanNo', sql.NVarChar, getValue(propertyData.PlanNo))
      .input('Volume', sql.NVarChar, getValue(propertyData.Volume))
      .input('Folio', sql.NVarChar, getValue(propertyData.Folio))
      .input('AreaOfNewBuildingWork', sql.NVarChar, getValue(propertyData.AreaOfNewBuildingWork))
      .input('Termites', sql.NVarChar, getValue(propertyData.Termites))
      .input('FloodProne', sql.NVarChar, getValue(propertyData.FloodProne))
      .input('BushfireProne', sql.NVarChar, getValue(propertyData.BushfireProne))
      .input('DesignatedLand', sql.NVarChar, getValue(propertyData.DesignatedLand))
      .input('AlpineArea', sql.NVarChar, getValue(propertyData.AlpineArea))
      .input('DeclaredRoad', sql.NVarChar, getValue(propertyData.DeclaredRoad))
      .input('Country', sql.NVarChar, getValue(propertyData.Country))
      .input('AllotmentArea', sql.Float, getValue(propertyData.AllotmentArea))
      .input('LotNo', sql.NVarChar, getValue(propertyData.LotNo))
      .input('PlanningPermitNo', sql.NVarChar, getValue(propertyData.PlanningPermitNo))
      .input('PlanningPermitDate', sql.NVarChar, getValue(propertyData.PlanningPermitDate))
      .input('MelwayRef', sql.NVarChar, getValue(propertyData.MelwayRef))
      .input('BushfireAttackLevel', sql.NVarChar, getValue(propertyData.BushfireAttackLevel))
      .input('Locality', sql.NVarChar, getValue(propertyData.Locality))
      .input('County', sql.NVarChar, getValue(propertyData.County))
      .input('Zonning', sql.NVarChar, getValue(propertyData.Zonning))
      .input('SmallLot', sql.NVarChar, getValue(propertyData.SmallLot))
      .input('SiteSlope', sql.NVarChar, getValue(propertyData.SiteSlope))
      .input('Precinct', sql.NVarChar, getValue(propertyData.Precinct))
      .input('GFA', sql.NVarChar, getValue(propertyData.GFA))
      .input('SiteCover', sql.NVarChar, getValue(propertyData.SiteCover))
      .input('SiteDimensionLength', sql.NVarChar, getValue(propertyData.SiteDimensionLength))
      .input('Ward', sql.NVarChar, getValue(propertyData.Ward))
      .input('Storeys', sql.NVarChar, getValue(propertyData.Storeys))
      .input('SiteDimensionWidth', sql.NVarChar, getValue(propertyData.SiteDimensionWidth))
      .input('NeighbourhoodPlan', sql.NVarChar, getValue(propertyData.NeighbourhoodPlan))
      .input('ReferralTriggers', sql.NVarChar, getValue(propertyData.ReferralTriggers))
      .input('SnowFall', sql.NVarChar, getValue(propertyData.SnowFall))
      .input('SeweredArea', sql.NVarChar, getValue(propertyData.SeweredArea))
      .input('StormwaterDischargePoint', sql.NVarChar, getValue(propertyData.StormwaterDischargePoint))
      .input('UncontrolledOverlandDrainage', sql.NVarChar, getValue(propertyData.UncontrolledOverlandDrainage))
      .input('Proposed', sql.NVarChar, getValue(propertyData.Proposed))
      .input('ExistingDwelling', sql.NVarChar, getValue(propertyData.ExistingDwelling))
      .input('UnitNumber', sql.NVarChar, getValue(propertyData.UnitNumber))
      .input('DetachedStatus', sql.NVarChar, getValue(propertyData.DetachedStatus))
      .input('StandardParcelIdentifier', sql.NVarChar, getValue(propertyData.StandardParcelIdentifier))
      .input('ShopNo', sql.NVarChar, getValue(propertyData.ShopNo))
      .input('Longitude', sql.Float, getValue(propertyData.Longitude))
      .input('Latitude', sql.Float, getValue(propertyData.Latitude))
      .input('ExistingUse', sql.NVarChar, getValue(propertyData.ExistingUse))
      .input('PropertyCode', sql.NVarChar, getValue(propertyData.PropertyCode))
      .input('StreetNumber2', sql.NVarChar, getValue(propertyData.StreetNumber2))
      .input('StreetType', sql.NVarChar, getValue(propertyData.StreetType))
      .input('ComplexUnitType', sql.NVarChar, getValue(propertyData.ComplexUnitType))
      .input('ComplexLevelType', sql.NVarChar, getValue(propertyData.ComplexLevelType))
      .input('ComplexLevelNumber', sql.NVarChar, getValue(propertyData.ComplexLevelNumber))
      .input('ComplexUnitIdentifier', sql.NVarChar, getValue(propertyData.ComplexUnitIdentifier))
      .input('WKID', sql.NVarChar, getValue(propertyData.WKID))
      .input('CadastralID', sql.NVarChar, getValue(propertyData.CadastralID))
      .input('LotType', sql.NVarChar, getValue(propertyData.LotType))
      .input('StreetSuffix', sql.NVarChar, getValue(propertyData.StreetSuffix))
      .input('GurasID', sql.NVarChar, getValue(propertyData.GurasID))
      .input('PropertySize', sql.NVarChar, getValue(propertyData.PropertySize))
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
          .input('ZoneCode', sql.NVarChar, getValue(zone.Zone_Code))
          .input('ZoneDescription', sql.NVarChar, getValue(zone.OverlayDescription))
          .query(`
            INSERT INTO Zone (
              SearchId,
              PropertyDetailId,
              ZoneCode,
              ZoneDescription
            )
            VALUES (
              @SearchId,
              @PropertyDetailId,
              @ZoneCode,
              @ZoneDescription
            )
          `);
      }
    }

    // Insert overlays
    if (overlays && overlays.length > 0) {
      for (const overlay of overlays) {
        await transaction.request()
          .input('PropertyDetailId', sql.Int, propertyDetailId)
          .input('SearchId', sql.Int, searchId)
          .input('OverlayCode', sql.NVarChar, getValue(overlay.Zone_Code))
          .input('OverlayDescription', sql.NVarChar, getValue(overlay.OverlayDescription))
          .query(`
            INSERT INTO Overlay (
              PropertyDetailId,
              SearchId,
              OverlayCode,
              OverlayDescription
            )
            VALUES (
              @PropertyDetailId,
              @SearchId,
              @OverlayCode,
              @OverlayDescription
            )
          `);
      }
    }

    // Commit the transaction
    await transaction.commit();

    return NextResponse.json({ 
      success: true, 
      searchId,
      propertyDetailId
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