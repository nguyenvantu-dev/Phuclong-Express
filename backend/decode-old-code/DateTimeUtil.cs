using System;
using System.Globalization;

public class DateTimeUtil
{
	private Calendar myCal;

	private CultureInfo myCI;

	private CalendarWeekRule myCWR;

	private DayOfWeek myFirstDOW;

	public DateTimeUtil()
	{
		myCI = new CultureInfo("vi-VN");
		myCal = myCI.Calendar;
		myCWR = myCI.DateTimeFormat.CalendarWeekRule;
		myFirstDOW = myCI.DateTimeFormat.FirstDayOfWeek;
	}

	public static string Datetime2Str(object vVal)
	{
		return ((!(vVal is DateTime)) ? Convert.ToDateTime(vVal.ToString()) : Convert.ToDateTime(vVal)).ToString("dddd, dd MMMM yyyy", new CultureInfo("vi-VN"));
	}

	public static string Datetime2Str(object vVal, string vFormat)
	{
		try
		{
			return ((!(vVal is DateTime)) ? Convert.ToDateTime(vVal.ToString()) : Convert.ToDateTime(vVal)).ToString(vFormat);
		}
		catch
		{
			return vVal.ToString();
		}
	}

	public static string getSqlDatetime(DateTime dt)
	{
		return dt.ToString("yyyy-MM-dd");
	}

	public static string getFullSqlDatetime(DateTime dt)
	{
		return dt.ToString("yyyy-MM-dd HH:mm:ss");
	}

	public static string getSqlDatetime(string vNew)
	{
		string[] array = vNew.Split('/');
		if (array.Length < 3)
		{
			return "";
		}
		return string.Join("-", array[2], array[1], array[0]);
	}

	public static string getISODatetime(DateTime dt)
	{
		return dt.ToString("yyyyMMdd");
	}

	public static string getISODatetime(string vNew)
	{
		string[] array = vNew.Split('/');
		if (array.Length < 3)
		{
			return "";
		}
		return string.Join("", array[2], array[1], array[0]);
	}

	public static string Datetime2StrLong(object vVal)
	{
		DateTime dateTime = ((!(vVal is DateTime)) ? Convert.ToDateTime(vVal.ToString()) : Convert.ToDateTime(vVal));
		return $"ngày {dateTime.Day} tháng {dateTime.Month} năm {dateTime.Year}";
	}

	public static string FullVNDateString(object vVal)
	{
		DateTime dateTime = ((!(vVal is DateTime)) ? Convert.ToDateTime(vVal.ToString()) : Convert.ToDateTime(vVal));
		string text = Datetime2Str(vVal);
		int length = text.IndexOf(',');
		string text2 = text.Substring(0, length);
		return string.Format("{3} ngày {0} tháng {1} năm {2}", dateTime.Day, dateTime.Month, dateTime.Year, text2);
	}

	public static DateTime? getDatetimeFromStr(string vNew)
	{
		if (string.IsNullOrEmpty(vNew))
		{
			return null;
		}
		string[] array = vNew.Split('/');
		if (array.Length < 3)
		{
			return null;
		}
		return new DateTime(Convert.ToInt32(array[2]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]));
	}

	public static DateTime? getDatetimeFromStrWithCurrentMinute(string vNew)
	{
		if (string.IsNullOrEmpty(vNew))
		{
			return null;
		}
		string[] array = vNew.Split('/');
		if (array.Length < 3)
		{
			return null;
		}
		DateTime now = DateTime.Now;
		return new DateTime(Convert.ToInt32(array[2]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]), now.Hour, now.Minute, now.Second);
	}

	public static DateTime AddDayWithoutWeekend(DateTime startdate, int numday)
	{
		try
		{
			if (numday < 1)
			{
				return startdate;
			}
			while (IsWeekend(startdate))
			{
				startdate = startdate.AddDays(1.0);
			}
			if (numday == 1)
			{
				return new DateTime(startdate.Year, startdate.Month, startdate.Day, 23, 59, 59);
			}
			DateTime dateTime = startdate;
			int num = 1;
			while (num < numday)
			{
				dateTime = dateTime.AddDays(1.0);
				if (!IsWeekend(dateTime))
				{
					num++;
				}
			}
			return dateTime;
		}
		catch
		{
			return startdate;
		}
	}

	private static bool IsWeekend(DateTime datetime)
	{
		if (datetime.DayOfWeek == DayOfWeek.Saturday || datetime.DayOfWeek == DayOfWeek.Sunday)
		{
			return true;
		}
		return false;
	}

	public static int GetNumDayWithoutWeekend(DateTime start, DateTime end)
	{
		while (IsWeekend(start))
		{
			start = start.AddDays(1.0);
		}
		if (end.Date >= start.Date)
		{
			int num = 1;
			while (start.Date < end.Date)
			{
				start = start.AddDays(1.0);
				if (!IsWeekend(start))
				{
					num++;
				}
			}
			return num;
		}
		return 0;
	}

	public static DateTime strToTime(DateTime date, string stime)
	{
		string[] array = stime.Split(':');
		if (array.Length < 3)
		{
			return default(DateTime);
		}
		return new DateTime(date.Year, date.Month, date.Day, Convert.ToInt32(array[0]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]));
	}

	public int GetNumWeekOfMonth(DateTime dt)
	{
		int daysInMonth = myCal.GetDaysInMonth(dt.Year, dt.Month);
		int weekIndex = GetWeekIndex(dt.AddDays(1 - dt.Day));
		int weekIndex2 = GetWeekIndex(new DateTime(dt.Year, dt.Month, daysInMonth));
		return weekIndex2 - weekIndex + 1;
	}

	public int GetWeekIndex(DateTime dtime)
	{
		return myCal.GetWeekOfYear(dtime, myCWR, myFirstDOW);
	}

	public DateTime GetFirstDayOfWeek(int wek, int year)
	{
		int num = 7 * wek / 31;
		DateTime dateTime = new DateTime(year, num + 1, 1).AddMonths(-1);
		for (int weekIndex = GetWeekIndex(dateTime); weekIndex != wek; weekIndex = GetWeekIndex(dateTime))
		{
			dateTime = dateTime.AddDays(1.0);
		}
		return dateTime;
	}

	public DateTime GetLastDayOfWeek(int wek, int year)
	{
		int num = 7 * wek / 31;
		DateTime dateTime = new DateTime(year, num + 1, 1).AddMonths(1);
		for (int weekIndex = GetWeekIndex(dateTime); weekIndex != wek; weekIndex = GetWeekIndex(dateTime))
		{
			dateTime = dateTime.AddDays(-1.0);
		}
		return dateTime;
	}

	public DateTime RemovePreviousMonth(DateTime dt, int month)
	{
		DateTime result = dt;
		while (result.Month != month)
		{
			result = result.AddDays(1.0);
		}
		return result;
	}

	public DateTime RemoveBehindMonth(DateTime dt, int month)
	{
		DateTime result = dt;
		while (result.Month != month)
		{
			result = result.AddDays(-1.0);
		}
		return result;
	}

	public DateTime GetFirstDateOfYear(int year)
	{
		return new DateTime(year, 1, 1);
	}

	public DateTime GetLastDateOfYear(int year)
	{
		return new DateTime(year, 12, 31);
	}

	public DateTime GetFirstDateOfQuarter(int Quarter, int year)
	{
		int month = (Quarter - 1) * 3 + 1;
		return new DateTime(year, month, 1);
	}

	public DateTime GetLastDateOfQuarter(int Quarter, int year)
	{
		int month = Quarter * 3;
		int daysInMonth = myCal.GetDaysInMonth(year, month);
		return new DateTime(year, month, daysInMonth);
	}

	public DateTime GetFirstDateOfMonth(int Month, int year)
	{
		return new DateTime(year, Month, 1);
	}

	public DateTime GetLastDateOfMonth(int Month, int year)
	{
		int daysInMonth = myCal.GetDaysInMonth(year, Month);
		return new DateTime(year, Month, daysInMonth);
	}
}
