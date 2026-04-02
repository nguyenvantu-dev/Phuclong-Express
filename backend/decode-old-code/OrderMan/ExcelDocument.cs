using System;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.ExtendedProperties;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.VariantTypes;

namespace OrderMan;

public class ExcelDocument
{
	public void CreatePackage(string filePath)
	{
		using SpreadsheetDocument document = SpreadsheetDocument.Create(filePath, SpreadsheetDocumentType.Workbook);
		CreateParts(document);
	}

	private void CreateParts(SpreadsheetDocument document)
	{
		ExtendedFilePropertiesPart extendedFilePropertiesPart = document.AddNewPart<ExtendedFilePropertiesPart>("rId3");
		GenerateExtendedFilePropertiesPart1Content(extendedFilePropertiesPart);
		WorkbookPart workbookPart = document.AddWorkbookPart();
		GenerateWorkbookPart1Content(workbookPart);
		WorksheetPart worksheetPart = workbookPart.AddNewPart<WorksheetPart>("rId3");
		GenerateWorksheetPart1Content(worksheetPart);
		WorksheetPart worksheetPart2 = workbookPart.AddNewPart<WorksheetPart>("rId2");
		GenerateWorksheetPart2Content(worksheetPart2);
		WorksheetPart worksheetPart3 = workbookPart.AddNewPart<WorksheetPart>("rId1");
		GenerateWorksheetPart3Content(worksheetPart3);
		WorkbookStylesPart workbookStylesPart = workbookPart.AddNewPart<WorkbookStylesPart>("rId5");
		GenerateWorkbookStylesPart1Content(workbookStylesPart);
		ThemePart themePart = workbookPart.AddNewPart<ThemePart>("rId4");
		GenerateThemePart1Content(themePart);
		SetPackageProperties(document);
	}

	private void GenerateExtendedFilePropertiesPart1Content(ExtendedFilePropertiesPart extendedFilePropertiesPart1)
	{
		Properties properties = new Properties();
		Application application = new Application();
		application.Text = "Microsoft Excel";
		DocumentSecurity documentSecurity = new DocumentSecurity();
		documentSecurity.Text = "0";
		ScaleCrop scaleCrop = new ScaleCrop();
		scaleCrop.Text = "false";
		HeadingPairs headingPairs = new HeadingPairs();
		VTVector vTVector = new VTVector
		{
			BaseType = VectorBaseValues.Variant,
			Size = 2u
		};
		Variant variant = new Variant();
		VTLPSTR vTLPSTR = new VTLPSTR();
		vTLPSTR.Text = "Worksheets";
		variant.Append(vTLPSTR);
		Variant variant2 = new Variant();
		VTInt32 vTInt = new VTInt32();
		vTInt.Text = "3";
		variant2.Append(vTInt);
		vTVector.Append(variant);
		vTVector.Append(variant2);
		headingPairs.Append(vTVector);
		TitlesOfParts titlesOfParts = new TitlesOfParts();
		VTVector vTVector2 = new VTVector
		{
			BaseType = VectorBaseValues.Lpstr,
			Size = 3u
		};
		VTLPSTR vTLPSTR2 = new VTLPSTR();
		vTLPSTR2.Text = "Sheet1";
		VTLPSTR vTLPSTR3 = new VTLPSTR();
		vTLPSTR3.Text = "Sheet2";
		VTLPSTR vTLPSTR4 = new VTLPSTR();
		vTLPSTR4.Text = "Sheet3";
		vTVector2.Append(vTLPSTR2);
		vTVector2.Append(vTLPSTR3);
		vTVector2.Append(vTLPSTR4);
		titlesOfParts.Append(vTVector2);
		Company company = new Company();
		company.Text = "None";
		LinksUpToDate linksUpToDate = new LinksUpToDate();
		linksUpToDate.Text = "false";
		SharedDocument sharedDocument = new SharedDocument();
		sharedDocument.Text = "false";
		HyperlinksChanged hyperlinksChanged = new HyperlinksChanged();
		hyperlinksChanged.Text = "false";
		ApplicationVersion applicationVersion = new ApplicationVersion();
		applicationVersion.Text = "12.0000";
		properties.Append(application);
		properties.Append(documentSecurity);
		properties.Append(scaleCrop);
		properties.Append(headingPairs);
		properties.Append(titlesOfParts);
		properties.Append(company);
		properties.Append(linksUpToDate);
		properties.Append(sharedDocument);
		properties.Append(hyperlinksChanged);
		properties.Append(applicationVersion);
		extendedFilePropertiesPart1.Properties = properties;
	}

	private void GenerateWorkbookPart1Content(WorkbookPart workbookPart1)
	{
		Workbook workbook = new Workbook();
		FileVersion fileVersion = new FileVersion
		{
			ApplicationName = "xl",
			LastEdited = "4",
			LowestEdited = "4",
			BuildVersion = "4506"
		};
		WorkbookProperties workbookProperties = new WorkbookProperties
		{
			DefaultThemeVersion = 124226u
		};
		BookViews bookViews = new BookViews();
		WorkbookView workbookView = new WorkbookView
		{
			XWindow = 0,
			YWindow = 45,
			WindowWidth = 19155u,
			WindowHeight = 11820u
		};
		bookViews.Append(workbookView);
		Sheets sheets = new Sheets();
		Sheet sheet = new Sheet
		{
			Name = "Sheet1",
			SheetId = 1u,
			Id = "rId1"
		};
		Sheet sheet2 = new Sheet
		{
			Name = "Sheet2",
			SheetId = 2u,
			Id = "rId2"
		};
		Sheet sheet3 = new Sheet
		{
			Name = "Sheet3",
			SheetId = 3u,
			Id = "rId3"
		};
		sheets.Append(sheet);
		sheets.Append(sheet2);
		sheets.Append(sheet3);
		CalculationProperties calculationProperties = new CalculationProperties
		{
			CalculationId = 125725u
		};
		workbook.Append(fileVersion);
		workbook.Append(workbookProperties);
		workbook.Append(bookViews);
		workbook.Append(sheets);
		workbook.Append(calculationProperties);
		workbookPart1.Workbook = workbook;
	}

	private void GenerateWorksheetPart1Content(WorksheetPart worksheetPart1)
	{
		Worksheet worksheet = new Worksheet();
		SheetDimension sheetDimension = new SheetDimension
		{
			Reference = "A1"
		};
		SheetViews sheetViews = new SheetViews();
		SheetView sheetView = new SheetView
		{
			WorkbookViewId = 0u
		};
		sheetViews.Append(sheetView);
		SheetFormatProperties sheetFormatProperties = new SheetFormatProperties
		{
			DefaultRowHeight = 15.0
		};
		SheetData sheetData = new SheetData();
		PageMargins pageMargins = new PageMargins
		{
			Left = 0.7,
			Right = 0.7,
			Top = 0.75,
			Bottom = 0.75,
			Header = 0.3,
			Footer = 0.3
		};
		worksheet.Append(sheetDimension);
		worksheet.Append(sheetViews);
		worksheet.Append(sheetFormatProperties);
		worksheet.Append(sheetData);
		worksheet.Append(pageMargins);
		worksheetPart1.Worksheet = worksheet;
	}

	private void GenerateWorksheetPart2Content(WorksheetPart worksheetPart2)
	{
		Worksheet worksheet = new Worksheet();
		SheetDimension sheetDimension = new SheetDimension
		{
			Reference = "A1"
		};
		SheetViews sheetViews = new SheetViews();
		SheetView sheetView = new SheetView
		{
			WorkbookViewId = 0u
		};
		sheetViews.Append(sheetView);
		SheetFormatProperties sheetFormatProperties = new SheetFormatProperties
		{
			DefaultRowHeight = 15.0
		};
		SheetData sheetData = new SheetData();
		PageMargins pageMargins = new PageMargins
		{
			Left = 0.7,
			Right = 0.7,
			Top = 0.75,
			Bottom = 0.75,
			Header = 0.3,
			Footer = 0.3
		};
		worksheet.Append(sheetDimension);
		worksheet.Append(sheetViews);
		worksheet.Append(sheetFormatProperties);
		worksheet.Append(sheetData);
		worksheet.Append(pageMargins);
		worksheetPart2.Worksheet = worksheet;
	}

	private void GenerateWorksheetPart3Content(WorksheetPart worksheetPart3)
	{
		Worksheet worksheet = new Worksheet();
		SheetDimension sheetDimension = new SheetDimension
		{
			Reference = "A1"
		};
		SheetViews sheetViews = new SheetViews();
		SheetView sheetView = new SheetView
		{
			TabSelected = true,
			WorkbookViewId = 0u
		};
		sheetViews.Append(sheetView);
		SheetFormatProperties sheetFormatProperties = new SheetFormatProperties
		{
			DefaultRowHeight = 15.0
		};
		SheetData sheetData = new SheetData();
		PageMargins pageMargins = new PageMargins
		{
			Left = 0.7,
			Right = 0.7,
			Top = 0.75,
			Bottom = 0.75,
			Header = 0.3,
			Footer = 0.3
		};
		worksheet.Append(sheetDimension);
		worksheet.Append(sheetViews);
		worksheet.Append(sheetFormatProperties);
		worksheet.Append(sheetData);
		worksheet.Append(pageMargins);
		worksheetPart3.Worksheet = worksheet;
	}

	private void GenerateWorkbookStylesPart1Content(WorkbookStylesPart workbookStylesPart1)
	{
		Stylesheet stylesheet = new Stylesheet();
		DocumentFormat.OpenXml.Spreadsheet.Fonts fonts = new DocumentFormat.OpenXml.Spreadsheet.Fonts
		{
			Count = 1u
		};
		Font font = new Font();
		FontSize fontSize = new FontSize
		{
			Val = 11.0
		};
		Color color = new Color
		{
			Theme = 1u
		};
		FontName fontName = new FontName
		{
			Val = "Calibri"
		};
		FontFamilyNumbering fontFamilyNumbering = new FontFamilyNumbering
		{
			Val = 2
		};
		DocumentFormat.OpenXml.Spreadsheet.FontScheme fontScheme = new DocumentFormat.OpenXml.Spreadsheet.FontScheme
		{
			Val = FontSchemeValues.Minor
		};
		font.Append(fontSize);
		font.Append(color);
		font.Append(fontName);
		font.Append(fontFamilyNumbering);
		font.Append(fontScheme);
		fonts.Append(font);
		Fills fills = new Fills
		{
			Count = 2u
		};
		DocumentFormat.OpenXml.Spreadsheet.Fill fill = new DocumentFormat.OpenXml.Spreadsheet.Fill();
		DocumentFormat.OpenXml.Spreadsheet.PatternFill patternFill = new DocumentFormat.OpenXml.Spreadsheet.PatternFill
		{
			PatternType = PatternValues.None
		};
		fill.Append(patternFill);
		DocumentFormat.OpenXml.Spreadsheet.Fill fill2 = new DocumentFormat.OpenXml.Spreadsheet.Fill();
		DocumentFormat.OpenXml.Spreadsheet.PatternFill patternFill2 = new DocumentFormat.OpenXml.Spreadsheet.PatternFill
		{
			PatternType = PatternValues.Gray125
		};
		fill2.Append(patternFill2);
		fills.Append(fill);
		fills.Append(fill2);
		Borders borders = new Borders
		{
			Count = 1u
		};
		Border border = new Border();
		DocumentFormat.OpenXml.Spreadsheet.LeftBorder leftBorder = new DocumentFormat.OpenXml.Spreadsheet.LeftBorder();
		DocumentFormat.OpenXml.Spreadsheet.RightBorder rightBorder = new DocumentFormat.OpenXml.Spreadsheet.RightBorder();
		DocumentFormat.OpenXml.Spreadsheet.TopBorder topBorder = new DocumentFormat.OpenXml.Spreadsheet.TopBorder();
		DocumentFormat.OpenXml.Spreadsheet.BottomBorder bottomBorder = new DocumentFormat.OpenXml.Spreadsheet.BottomBorder();
		DiagonalBorder diagonalBorder = new DiagonalBorder();
		border.Append(leftBorder);
		border.Append(rightBorder);
		border.Append(topBorder);
		border.Append(bottomBorder);
		border.Append(diagonalBorder);
		borders.Append(border);
		CellStyleFormats cellStyleFormats = new CellStyleFormats
		{
			Count = 1u
		};
		CellFormat cellFormat = new CellFormat
		{
			NumberFormatId = 0u,
			FontId = 0u,
			FillId = 0u,
			BorderId = 0u
		};
		cellStyleFormats.Append(cellFormat);
		CellFormats cellFormats = new CellFormats
		{
			Count = 1u
		};
		CellFormat cellFormat2 = new CellFormat
		{
			NumberFormatId = 0u,
			FontId = 0u,
			FillId = 0u,
			BorderId = 0u,
			FormatId = 0u
		};
		cellFormats.Append(cellFormat2);
		CellStyles cellStyles = new CellStyles
		{
			Count = 1u
		};
		CellStyle cellStyle = new CellStyle
		{
			Name = "Normal",
			FormatId = 0u,
			BuiltinId = 0u
		};
		cellStyles.Append(cellStyle);
		DifferentialFormats differentialFormats = new DifferentialFormats
		{
			Count = 0u
		};
		TableStyles tableStyles = new TableStyles
		{
			Count = 0u,
			DefaultTableStyle = "TableStyleMedium9",
			DefaultPivotStyle = "PivotStyleLight16"
		};
		stylesheet.Append(fonts);
		stylesheet.Append(fills);
		stylesheet.Append(borders);
		stylesheet.Append(cellStyleFormats);
		stylesheet.Append(cellFormats);
		stylesheet.Append(cellStyles);
		stylesheet.Append(differentialFormats);
		stylesheet.Append(tableStyles);
		workbookStylesPart1.Stylesheet = stylesheet;
	}

	private void GenerateThemePart1Content(ThemePart themePart1)
	{
		Theme theme = new Theme
		{
			Name = "Office Theme"
		};
		ThemeElements themeElements = new ThemeElements();
		ColorScheme colorScheme = new ColorScheme
		{
			Name = "Office"
		};
		Dark1Color dark1Color = new Dark1Color();
		SystemColor systemColor = new SystemColor
		{
			Val = SystemColorValues.WindowText,
			LastColor = "000000"
		};
		dark1Color.Append(systemColor);
		Light1Color light1Color = new Light1Color();
		SystemColor systemColor2 = new SystemColor
		{
			Val = SystemColorValues.Window,
			LastColor = "FFFFFF"
		};
		light1Color.Append(systemColor2);
		Dark2Color dark2Color = new Dark2Color();
		RgbColorModelHex rgbColorModelHex = new RgbColorModelHex
		{
			Val = "1F497D"
		};
		dark2Color.Append(rgbColorModelHex);
		Light2Color light2Color = new Light2Color();
		RgbColorModelHex rgbColorModelHex2 = new RgbColorModelHex
		{
			Val = "EEECE1"
		};
		light2Color.Append(rgbColorModelHex2);
		Accent1Color accent1Color = new Accent1Color();
		RgbColorModelHex rgbColorModelHex3 = new RgbColorModelHex
		{
			Val = "4F81BD"
		};
		accent1Color.Append(rgbColorModelHex3);
		Accent2Color accent2Color = new Accent2Color();
		RgbColorModelHex rgbColorModelHex4 = new RgbColorModelHex
		{
			Val = "C0504D"
		};
		accent2Color.Append(rgbColorModelHex4);
		Accent3Color accent3Color = new Accent3Color();
		RgbColorModelHex rgbColorModelHex5 = new RgbColorModelHex
		{
			Val = "9BBB59"
		};
		accent3Color.Append(rgbColorModelHex5);
		Accent4Color accent4Color = new Accent4Color();
		RgbColorModelHex rgbColorModelHex6 = new RgbColorModelHex
		{
			Val = "8064A2"
		};
		accent4Color.Append(rgbColorModelHex6);
		Accent5Color accent5Color = new Accent5Color();
		RgbColorModelHex rgbColorModelHex7 = new RgbColorModelHex
		{
			Val = "4BACC6"
		};
		accent5Color.Append(rgbColorModelHex7);
		Accent6Color accent6Color = new Accent6Color();
		RgbColorModelHex rgbColorModelHex8 = new RgbColorModelHex
		{
			Val = "F79646"
		};
		accent6Color.Append(rgbColorModelHex8);
		DocumentFormat.OpenXml.Drawing.Hyperlink hyperlink = new DocumentFormat.OpenXml.Drawing.Hyperlink();
		RgbColorModelHex rgbColorModelHex9 = new RgbColorModelHex
		{
			Val = "0000FF"
		};
		hyperlink.Append(rgbColorModelHex9);
		FollowedHyperlinkColor followedHyperlinkColor = new FollowedHyperlinkColor();
		RgbColorModelHex rgbColorModelHex10 = new RgbColorModelHex
		{
			Val = "800080"
		};
		followedHyperlinkColor.Append(rgbColorModelHex10);
		colorScheme.Append(dark1Color);
		colorScheme.Append(light1Color);
		colorScheme.Append(dark2Color);
		colorScheme.Append(light2Color);
		colorScheme.Append(accent1Color);
		colorScheme.Append(accent2Color);
		colorScheme.Append(accent3Color);
		colorScheme.Append(accent4Color);
		colorScheme.Append(accent5Color);
		colorScheme.Append(accent6Color);
		colorScheme.Append(hyperlink);
		colorScheme.Append(followedHyperlinkColor);
		DocumentFormat.OpenXml.Drawing.FontScheme fontScheme = new DocumentFormat.OpenXml.Drawing.FontScheme
		{
			Name = "Office"
		};
		MajorFont majorFont = new MajorFont();
		LatinFont latinFont = new LatinFont
		{
			Typeface = "Cambria"
		};
		EastAsianFont eastAsianFont = new EastAsianFont
		{
			Typeface = ""
		};
		ComplexScriptFont complexScriptFont = new ComplexScriptFont
		{
			Typeface = ""
		};
		SupplementalFont supplementalFont = new SupplementalFont
		{
			Script = "Jpan",
			Typeface = "ＭＳ Ｐゴシック"
		};
		SupplementalFont supplementalFont2 = new SupplementalFont
		{
			Script = "Hang",
			Typeface = "맑은 고딕"
		};
		SupplementalFont supplementalFont3 = new SupplementalFont
		{
			Script = "Hans",
			Typeface = "宋体"
		};
		SupplementalFont supplementalFont4 = new SupplementalFont
		{
			Script = "Hant",
			Typeface = "新細明體"
		};
		SupplementalFont supplementalFont5 = new SupplementalFont
		{
			Script = "Arab",
			Typeface = "Times New Roman"
		};
		SupplementalFont supplementalFont6 = new SupplementalFont
		{
			Script = "Hebr",
			Typeface = "Times New Roman"
		};
		SupplementalFont supplementalFont7 = new SupplementalFont
		{
			Script = "Thai",
			Typeface = "Tahoma"
		};
		SupplementalFont supplementalFont8 = new SupplementalFont
		{
			Script = "Ethi",
			Typeface = "Nyala"
		};
		SupplementalFont supplementalFont9 = new SupplementalFont
		{
			Script = "Beng",
			Typeface = "Vrinda"
		};
		SupplementalFont supplementalFont10 = new SupplementalFont
		{
			Script = "Gujr",
			Typeface = "Shruti"
		};
		SupplementalFont supplementalFont11 = new SupplementalFont
		{
			Script = "Khmr",
			Typeface = "MoolBoran"
		};
		SupplementalFont supplementalFont12 = new SupplementalFont
		{
			Script = "Knda",
			Typeface = "Tunga"
		};
		SupplementalFont supplementalFont13 = new SupplementalFont
		{
			Script = "Guru",
			Typeface = "Raavi"
		};
		SupplementalFont supplementalFont14 = new SupplementalFont
		{
			Script = "Cans",
			Typeface = "Euphemia"
		};
		SupplementalFont supplementalFont15 = new SupplementalFont
		{
			Script = "Cher",
			Typeface = "Plantagenet Cherokee"
		};
		SupplementalFont supplementalFont16 = new SupplementalFont
		{
			Script = "Yiii",
			Typeface = "Microsoft Yi Baiti"
		};
		SupplementalFont supplementalFont17 = new SupplementalFont
		{
			Script = "Tibt",
			Typeface = "Microsoft Himalaya"
		};
		SupplementalFont supplementalFont18 = new SupplementalFont
		{
			Script = "Thaa",
			Typeface = "MV Boli"
		};
		SupplementalFont supplementalFont19 = new SupplementalFont
		{
			Script = "Deva",
			Typeface = "Mangal"
		};
		SupplementalFont supplementalFont20 = new SupplementalFont
		{
			Script = "Telu",
			Typeface = "Gautami"
		};
		SupplementalFont supplementalFont21 = new SupplementalFont
		{
			Script = "Taml",
			Typeface = "Latha"
		};
		SupplementalFont supplementalFont22 = new SupplementalFont
		{
			Script = "Syrc",
			Typeface = "Estrangelo Edessa"
		};
		SupplementalFont supplementalFont23 = new SupplementalFont
		{
			Script = "Orya",
			Typeface = "Kalinga"
		};
		SupplementalFont supplementalFont24 = new SupplementalFont
		{
			Script = "Mlym",
			Typeface = "Kartika"
		};
		SupplementalFont supplementalFont25 = new SupplementalFont
		{
			Script = "Laoo",
			Typeface = "DokChampa"
		};
		SupplementalFont supplementalFont26 = new SupplementalFont
		{
			Script = "Sinh",
			Typeface = "Iskoola Pota"
		};
		SupplementalFont supplementalFont27 = new SupplementalFont
		{
			Script = "Mong",
			Typeface = "Mongolian Baiti"
		};
		SupplementalFont supplementalFont28 = new SupplementalFont
		{
			Script = "Viet",
			Typeface = "Times New Roman"
		};
		SupplementalFont supplementalFont29 = new SupplementalFont
		{
			Script = "Uigh",
			Typeface = "Microsoft Uighur"
		};
		majorFont.Append(latinFont);
		majorFont.Append(eastAsianFont);
		majorFont.Append(complexScriptFont);
		majorFont.Append(supplementalFont);
		majorFont.Append(supplementalFont2);
		majorFont.Append(supplementalFont3);
		majorFont.Append(supplementalFont4);
		majorFont.Append(supplementalFont5);
		majorFont.Append(supplementalFont6);
		majorFont.Append(supplementalFont7);
		majorFont.Append(supplementalFont8);
		majorFont.Append(supplementalFont9);
		majorFont.Append(supplementalFont10);
		majorFont.Append(supplementalFont11);
		majorFont.Append(supplementalFont12);
		majorFont.Append(supplementalFont13);
		majorFont.Append(supplementalFont14);
		majorFont.Append(supplementalFont15);
		majorFont.Append(supplementalFont16);
		majorFont.Append(supplementalFont17);
		majorFont.Append(supplementalFont18);
		majorFont.Append(supplementalFont19);
		majorFont.Append(supplementalFont20);
		majorFont.Append(supplementalFont21);
		majorFont.Append(supplementalFont22);
		majorFont.Append(supplementalFont23);
		majorFont.Append(supplementalFont24);
		majorFont.Append(supplementalFont25);
		majorFont.Append(supplementalFont26);
		majorFont.Append(supplementalFont27);
		majorFont.Append(supplementalFont28);
		majorFont.Append(supplementalFont29);
		MinorFont minorFont = new MinorFont();
		LatinFont latinFont2 = new LatinFont
		{
			Typeface = "Calibri"
		};
		EastAsianFont eastAsianFont2 = new EastAsianFont
		{
			Typeface = ""
		};
		ComplexScriptFont complexScriptFont2 = new ComplexScriptFont
		{
			Typeface = ""
		};
		SupplementalFont supplementalFont30 = new SupplementalFont
		{
			Script = "Jpan",
			Typeface = "ＭＳ Ｐゴシック"
		};
		SupplementalFont supplementalFont31 = new SupplementalFont
		{
			Script = "Hang",
			Typeface = "맑은 고딕"
		};
		SupplementalFont supplementalFont32 = new SupplementalFont
		{
			Script = "Hans",
			Typeface = "宋体"
		};
		SupplementalFont supplementalFont33 = new SupplementalFont
		{
			Script = "Hant",
			Typeface = "新細明體"
		};
		SupplementalFont supplementalFont34 = new SupplementalFont
		{
			Script = "Arab",
			Typeface = "Arial"
		};
		SupplementalFont supplementalFont35 = new SupplementalFont
		{
			Script = "Hebr",
			Typeface = "Arial"
		};
		SupplementalFont supplementalFont36 = new SupplementalFont
		{
			Script = "Thai",
			Typeface = "Tahoma"
		};
		SupplementalFont supplementalFont37 = new SupplementalFont
		{
			Script = "Ethi",
			Typeface = "Nyala"
		};
		SupplementalFont supplementalFont38 = new SupplementalFont
		{
			Script = "Beng",
			Typeface = "Vrinda"
		};
		SupplementalFont supplementalFont39 = new SupplementalFont
		{
			Script = "Gujr",
			Typeface = "Shruti"
		};
		SupplementalFont supplementalFont40 = new SupplementalFont
		{
			Script = "Khmr",
			Typeface = "DaunPenh"
		};
		SupplementalFont supplementalFont41 = new SupplementalFont
		{
			Script = "Knda",
			Typeface = "Tunga"
		};
		SupplementalFont supplementalFont42 = new SupplementalFont
		{
			Script = "Guru",
			Typeface = "Raavi"
		};
		SupplementalFont supplementalFont43 = new SupplementalFont
		{
			Script = "Cans",
			Typeface = "Euphemia"
		};
		SupplementalFont supplementalFont44 = new SupplementalFont
		{
			Script = "Cher",
			Typeface = "Plantagenet Cherokee"
		};
		SupplementalFont supplementalFont45 = new SupplementalFont
		{
			Script = "Yiii",
			Typeface = "Microsoft Yi Baiti"
		};
		SupplementalFont supplementalFont46 = new SupplementalFont
		{
			Script = "Tibt",
			Typeface = "Microsoft Himalaya"
		};
		SupplementalFont supplementalFont47 = new SupplementalFont
		{
			Script = "Thaa",
			Typeface = "MV Boli"
		};
		SupplementalFont supplementalFont48 = new SupplementalFont
		{
			Script = "Deva",
			Typeface = "Mangal"
		};
		SupplementalFont supplementalFont49 = new SupplementalFont
		{
			Script = "Telu",
			Typeface = "Gautami"
		};
		SupplementalFont supplementalFont50 = new SupplementalFont
		{
			Script = "Taml",
			Typeface = "Latha"
		};
		SupplementalFont supplementalFont51 = new SupplementalFont
		{
			Script = "Syrc",
			Typeface = "Estrangelo Edessa"
		};
		SupplementalFont supplementalFont52 = new SupplementalFont
		{
			Script = "Orya",
			Typeface = "Kalinga"
		};
		SupplementalFont supplementalFont53 = new SupplementalFont
		{
			Script = "Mlym",
			Typeface = "Kartika"
		};
		SupplementalFont supplementalFont54 = new SupplementalFont
		{
			Script = "Laoo",
			Typeface = "DokChampa"
		};
		SupplementalFont supplementalFont55 = new SupplementalFont
		{
			Script = "Sinh",
			Typeface = "Iskoola Pota"
		};
		SupplementalFont supplementalFont56 = new SupplementalFont
		{
			Script = "Mong",
			Typeface = "Mongolian Baiti"
		};
		SupplementalFont supplementalFont57 = new SupplementalFont
		{
			Script = "Viet",
			Typeface = "Arial"
		};
		SupplementalFont supplementalFont58 = new SupplementalFont
		{
			Script = "Uigh",
			Typeface = "Microsoft Uighur"
		};
		minorFont.Append(latinFont2);
		minorFont.Append(eastAsianFont2);
		minorFont.Append(complexScriptFont2);
		minorFont.Append(supplementalFont30);
		minorFont.Append(supplementalFont31);
		minorFont.Append(supplementalFont32);
		minorFont.Append(supplementalFont33);
		minorFont.Append(supplementalFont34);
		minorFont.Append(supplementalFont35);
		minorFont.Append(supplementalFont36);
		minorFont.Append(supplementalFont37);
		minorFont.Append(supplementalFont38);
		minorFont.Append(supplementalFont39);
		minorFont.Append(supplementalFont40);
		minorFont.Append(supplementalFont41);
		minorFont.Append(supplementalFont42);
		minorFont.Append(supplementalFont43);
		minorFont.Append(supplementalFont44);
		minorFont.Append(supplementalFont45);
		minorFont.Append(supplementalFont46);
		minorFont.Append(supplementalFont47);
		minorFont.Append(supplementalFont48);
		minorFont.Append(supplementalFont49);
		minorFont.Append(supplementalFont50);
		minorFont.Append(supplementalFont51);
		minorFont.Append(supplementalFont52);
		minorFont.Append(supplementalFont53);
		minorFont.Append(supplementalFont54);
		minorFont.Append(supplementalFont55);
		minorFont.Append(supplementalFont56);
		minorFont.Append(supplementalFont57);
		minorFont.Append(supplementalFont58);
		fontScheme.Append(majorFont);
		fontScheme.Append(minorFont);
		FormatScheme formatScheme = new FormatScheme
		{
			Name = "Office"
		};
		FillStyleList fillStyleList = new FillStyleList();
		SolidFill solidFill = new SolidFill();
		SchemeColor schemeColor = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		solidFill.Append(schemeColor);
		DocumentFormat.OpenXml.Drawing.GradientFill gradientFill = new DocumentFormat.OpenXml.Drawing.GradientFill
		{
			RotateWithShape = true
		};
		GradientStopList gradientStopList = new GradientStopList();
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 0
		};
		SchemeColor schemeColor2 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Tint tint = new Tint
		{
			Val = 50000
		};
		SaturationModulation saturationModulation = new SaturationModulation
		{
			Val = 300000
		};
		schemeColor2.Append(tint);
		schemeColor2.Append(saturationModulation);
		gradientStop.Append(schemeColor2);
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop2 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 35000
		};
		SchemeColor schemeColor3 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Tint tint2 = new Tint
		{
			Val = 37000
		};
		SaturationModulation saturationModulation2 = new SaturationModulation
		{
			Val = 300000
		};
		schemeColor3.Append(tint2);
		schemeColor3.Append(saturationModulation2);
		gradientStop2.Append(schemeColor3);
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop3 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 100000
		};
		SchemeColor schemeColor4 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Tint tint3 = new Tint
		{
			Val = 15000
		};
		SaturationModulation saturationModulation3 = new SaturationModulation
		{
			Val = 350000
		};
		schemeColor4.Append(tint3);
		schemeColor4.Append(saturationModulation3);
		gradientStop3.Append(schemeColor4);
		gradientStopList.Append(gradientStop);
		gradientStopList.Append(gradientStop2);
		gradientStopList.Append(gradientStop3);
		LinearGradientFill linearGradientFill = new LinearGradientFill
		{
			Angle = 16200000,
			Scaled = true
		};
		gradientFill.Append(gradientStopList);
		gradientFill.Append(linearGradientFill);
		DocumentFormat.OpenXml.Drawing.GradientFill gradientFill2 = new DocumentFormat.OpenXml.Drawing.GradientFill
		{
			RotateWithShape = true
		};
		GradientStopList gradientStopList2 = new GradientStopList();
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop4 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 0
		};
		SchemeColor schemeColor5 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Shade shade = new Shade
		{
			Val = 51000
		};
		SaturationModulation saturationModulation4 = new SaturationModulation
		{
			Val = 130000
		};
		schemeColor5.Append(shade);
		schemeColor5.Append(saturationModulation4);
		gradientStop4.Append(schemeColor5);
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop5 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 80000
		};
		SchemeColor schemeColor6 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Shade shade2 = new Shade
		{
			Val = 93000
		};
		SaturationModulation saturationModulation5 = new SaturationModulation
		{
			Val = 130000
		};
		schemeColor6.Append(shade2);
		schemeColor6.Append(saturationModulation5);
		gradientStop5.Append(schemeColor6);
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop6 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 100000
		};
		SchemeColor schemeColor7 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Shade shade3 = new Shade
		{
			Val = 94000
		};
		SaturationModulation saturationModulation6 = new SaturationModulation
		{
			Val = 135000
		};
		schemeColor7.Append(shade3);
		schemeColor7.Append(saturationModulation6);
		gradientStop6.Append(schemeColor7);
		gradientStopList2.Append(gradientStop4);
		gradientStopList2.Append(gradientStop5);
		gradientStopList2.Append(gradientStop6);
		LinearGradientFill linearGradientFill2 = new LinearGradientFill
		{
			Angle = 16200000,
			Scaled = false
		};
		gradientFill2.Append(gradientStopList2);
		gradientFill2.Append(linearGradientFill2);
		fillStyleList.Append(solidFill);
		fillStyleList.Append(gradientFill);
		fillStyleList.Append(gradientFill2);
		LineStyleList lineStyleList = new LineStyleList();
		DocumentFormat.OpenXml.Drawing.Outline outline = new DocumentFormat.OpenXml.Drawing.Outline
		{
			Width = 9525,
			CapType = LineCapValues.Flat,
			CompoundLineType = CompoundLineValues.Single,
			Alignment = PenAlignmentValues.Center
		};
		SolidFill solidFill2 = new SolidFill();
		SchemeColor schemeColor8 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Shade shade4 = new Shade
		{
			Val = 95000
		};
		SaturationModulation saturationModulation7 = new SaturationModulation
		{
			Val = 105000
		};
		schemeColor8.Append(shade4);
		schemeColor8.Append(saturationModulation7);
		solidFill2.Append(schemeColor8);
		PresetDash presetDash = new PresetDash
		{
			Val = PresetLineDashValues.Solid
		};
		outline.Append(solidFill2);
		outline.Append(presetDash);
		DocumentFormat.OpenXml.Drawing.Outline outline2 = new DocumentFormat.OpenXml.Drawing.Outline
		{
			Width = 25400,
			CapType = LineCapValues.Flat,
			CompoundLineType = CompoundLineValues.Single,
			Alignment = PenAlignmentValues.Center
		};
		SolidFill solidFill3 = new SolidFill();
		SchemeColor schemeColor9 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		solidFill3.Append(schemeColor9);
		PresetDash presetDash2 = new PresetDash
		{
			Val = PresetLineDashValues.Solid
		};
		outline2.Append(solidFill3);
		outline2.Append(presetDash2);
		DocumentFormat.OpenXml.Drawing.Outline outline3 = new DocumentFormat.OpenXml.Drawing.Outline
		{
			Width = 38100,
			CapType = LineCapValues.Flat,
			CompoundLineType = CompoundLineValues.Single,
			Alignment = PenAlignmentValues.Center
		};
		SolidFill solidFill4 = new SolidFill();
		SchemeColor schemeColor10 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		solidFill4.Append(schemeColor10);
		PresetDash presetDash3 = new PresetDash
		{
			Val = PresetLineDashValues.Solid
		};
		outline3.Append(solidFill4);
		outline3.Append(presetDash3);
		lineStyleList.Append(outline);
		lineStyleList.Append(outline2);
		lineStyleList.Append(outline3);
		EffectStyleList effectStyleList = new EffectStyleList();
		EffectStyle effectStyle = new EffectStyle();
		EffectList effectList = new EffectList();
		OuterShadow outerShadow = new OuterShadow
		{
			BlurRadius = 40000L,
			Distance = 20000L,
			Direction = 5400000,
			RotateWithShape = false
		};
		RgbColorModelHex rgbColorModelHex11 = new RgbColorModelHex
		{
			Val = "000000"
		};
		Alpha alpha = new Alpha
		{
			Val = 38000
		};
		rgbColorModelHex11.Append(alpha);
		outerShadow.Append(rgbColorModelHex11);
		effectList.Append(outerShadow);
		effectStyle.Append(effectList);
		EffectStyle effectStyle2 = new EffectStyle();
		EffectList effectList2 = new EffectList();
		OuterShadow outerShadow2 = new OuterShadow
		{
			BlurRadius = 40000L,
			Distance = 23000L,
			Direction = 5400000,
			RotateWithShape = false
		};
		RgbColorModelHex rgbColorModelHex12 = new RgbColorModelHex
		{
			Val = "000000"
		};
		Alpha alpha2 = new Alpha
		{
			Val = 35000
		};
		rgbColorModelHex12.Append(alpha2);
		outerShadow2.Append(rgbColorModelHex12);
		effectList2.Append(outerShadow2);
		effectStyle2.Append(effectList2);
		EffectStyle effectStyle3 = new EffectStyle();
		EffectList effectList3 = new EffectList();
		OuterShadow outerShadow3 = new OuterShadow
		{
			BlurRadius = 40000L,
			Distance = 23000L,
			Direction = 5400000,
			RotateWithShape = false
		};
		RgbColorModelHex rgbColorModelHex13 = new RgbColorModelHex
		{
			Val = "000000"
		};
		Alpha alpha3 = new Alpha
		{
			Val = 35000
		};
		rgbColorModelHex13.Append(alpha3);
		outerShadow3.Append(rgbColorModelHex13);
		effectList3.Append(outerShadow3);
		Scene3DType scene3DType = new Scene3DType();
		Camera camera = new Camera
		{
			Preset = PresetCameraValues.OrthographicFront
		};
		Rotation rotation = new Rotation
		{
			Latitude = 0,
			Longitude = 0,
			Revolution = 0
		};
		camera.Append(rotation);
		LightRig lightRig = new LightRig
		{
			Rig = LightRigValues.ThreePoints,
			Direction = LightRigDirectionValues.Top
		};
		Rotation rotation2 = new Rotation
		{
			Latitude = 0,
			Longitude = 0,
			Revolution = 1200000
		};
		lightRig.Append(rotation2);
		scene3DType.Append(camera);
		scene3DType.Append(lightRig);
		Shape3DType shape3DType = new Shape3DType();
		BevelTop bevelTop = new BevelTop
		{
			Width = 63500L,
			Height = 25400L
		};
		shape3DType.Append(bevelTop);
		effectStyle3.Append(effectList3);
		effectStyle3.Append(scene3DType);
		effectStyle3.Append(shape3DType);
		effectStyleList.Append(effectStyle);
		effectStyleList.Append(effectStyle2);
		effectStyleList.Append(effectStyle3);
		BackgroundFillStyleList backgroundFillStyleList = new BackgroundFillStyleList();
		SolidFill solidFill5 = new SolidFill();
		SchemeColor schemeColor11 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		solidFill5.Append(schemeColor11);
		DocumentFormat.OpenXml.Drawing.GradientFill gradientFill3 = new DocumentFormat.OpenXml.Drawing.GradientFill
		{
			RotateWithShape = true
		};
		GradientStopList gradientStopList3 = new GradientStopList();
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop7 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 0
		};
		SchemeColor schemeColor12 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Tint tint4 = new Tint
		{
			Val = 40000
		};
		SaturationModulation saturationModulation8 = new SaturationModulation
		{
			Val = 350000
		};
		schemeColor12.Append(tint4);
		schemeColor12.Append(saturationModulation8);
		gradientStop7.Append(schemeColor12);
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop8 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 40000
		};
		SchemeColor schemeColor13 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Tint tint5 = new Tint
		{
			Val = 45000
		};
		Shade shade5 = new Shade
		{
			Val = 99000
		};
		SaturationModulation saturationModulation9 = new SaturationModulation
		{
			Val = 350000
		};
		schemeColor13.Append(tint5);
		schemeColor13.Append(shade5);
		schemeColor13.Append(saturationModulation9);
		gradientStop8.Append(schemeColor13);
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop9 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 100000
		};
		SchemeColor schemeColor14 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Shade shade6 = new Shade
		{
			Val = 20000
		};
		SaturationModulation saturationModulation10 = new SaturationModulation
		{
			Val = 255000
		};
		schemeColor14.Append(shade6);
		schemeColor14.Append(saturationModulation10);
		gradientStop9.Append(schemeColor14);
		gradientStopList3.Append(gradientStop7);
		gradientStopList3.Append(gradientStop8);
		gradientStopList3.Append(gradientStop9);
		PathGradientFill pathGradientFill = new PathGradientFill
		{
			Path = PathShadeValues.Circle
		};
		FillToRectangle fillToRectangle = new FillToRectangle
		{
			Left = 50000,
			Top = -80000,
			Right = 50000,
			Bottom = 180000
		};
		pathGradientFill.Append(fillToRectangle);
		gradientFill3.Append(gradientStopList3);
		gradientFill3.Append(pathGradientFill);
		DocumentFormat.OpenXml.Drawing.GradientFill gradientFill4 = new DocumentFormat.OpenXml.Drawing.GradientFill
		{
			RotateWithShape = true
		};
		GradientStopList gradientStopList4 = new GradientStopList();
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop10 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 0
		};
		SchemeColor schemeColor15 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Tint tint6 = new Tint
		{
			Val = 80000
		};
		SaturationModulation saturationModulation11 = new SaturationModulation
		{
			Val = 300000
		};
		schemeColor15.Append(tint6);
		schemeColor15.Append(saturationModulation11);
		gradientStop10.Append(schemeColor15);
		DocumentFormat.OpenXml.Drawing.GradientStop gradientStop11 = new DocumentFormat.OpenXml.Drawing.GradientStop
		{
			Position = 100000
		};
		SchemeColor schemeColor16 = new SchemeColor
		{
			Val = SchemeColorValues.PhColor
		};
		Shade shade7 = new Shade
		{
			Val = 30000
		};
		SaturationModulation saturationModulation12 = new SaturationModulation
		{
			Val = 200000
		};
		schemeColor16.Append(shade7);
		schemeColor16.Append(saturationModulation12);
		gradientStop11.Append(schemeColor16);
		gradientStopList4.Append(gradientStop10);
		gradientStopList4.Append(gradientStop11);
		PathGradientFill pathGradientFill2 = new PathGradientFill
		{
			Path = PathShadeValues.Circle
		};
		FillToRectangle fillToRectangle2 = new FillToRectangle
		{
			Left = 50000,
			Top = 50000,
			Right = 50000,
			Bottom = 50000
		};
		pathGradientFill2.Append(fillToRectangle2);
		gradientFill4.Append(gradientStopList4);
		gradientFill4.Append(pathGradientFill2);
		backgroundFillStyleList.Append(solidFill5);
		backgroundFillStyleList.Append(gradientFill3);
		backgroundFillStyleList.Append(gradientFill4);
		formatScheme.Append(fillStyleList);
		formatScheme.Append(lineStyleList);
		formatScheme.Append(effectStyleList);
		formatScheme.Append(backgroundFillStyleList);
		themeElements.Append(colorScheme);
		themeElements.Append(fontScheme);
		themeElements.Append(formatScheme);
		ObjectDefaults objectDefaults = new ObjectDefaults();
		ExtraColorSchemeList extraColorSchemeList = new ExtraColorSchemeList();
		theme.Append(themeElements);
		theme.Append(objectDefaults);
		theme.Append(extraColorSchemeList);
		themePart1.Theme = theme;
	}

	private void SetPackageProperties(OpenXmlPackage document)
	{
		document.PackageProperties.Creator = "Author Name";
		document.PackageProperties.Created = DateTime.Now;
		document.PackageProperties.Modified = DateTime.Now;
		document.PackageProperties.LastModifiedBy = "Author Name";
	}
}
