using System;
using System.Collections;
using System.Reflection;

namespace OrderMan;

public class StringEnum
{
	private Type _enumType;

	private static Hashtable _stringValues = new Hashtable();

	public Type EnumType => _enumType;

	public StringEnum(Type enumType)
	{
		if (!enumType.IsEnum)
		{
			throw new ArgumentException($"Supplied type must be an Enum.  Type was {enumType.ToString()}");
		}
		_enumType = enumType;
	}

	public string GetStringValue(string valueName)
	{
		string result = null;
		try
		{
			Enum value = (Enum)Enum.Parse(_enumType, valueName);
			result = GetStringValue(value);
		}
		catch (Exception)
		{
		}
		return result;
	}

	public Array GetStringValues()
	{
		ArrayList arrayList = new ArrayList();
		FieldInfo[] fields = _enumType.GetFields();
		foreach (FieldInfo fieldInfo in fields)
		{
			StringValueAttribute[] array = fieldInfo.GetCustomAttributes(typeof(StringValueAttribute), inherit: false) as StringValueAttribute[];
			if (array.Length != 0)
			{
				arrayList.Add(array[0].Value);
			}
		}
		return arrayList.ToArray();
	}

	public IList GetListValues()
	{
		Type underlyingType = Enum.GetUnderlyingType(_enumType);
		ArrayList arrayList = new ArrayList();
		FieldInfo[] fields = _enumType.GetFields();
		foreach (FieldInfo fieldInfo in fields)
		{
			StringValueAttribute[] array = fieldInfo.GetCustomAttributes(typeof(StringValueAttribute), inherit: false) as StringValueAttribute[];
			if (array.Length != 0)
			{
				arrayList.Add(new DictionaryEntry(Convert.ChangeType(Enum.Parse(_enumType, fieldInfo.Name), underlyingType), array[0].Value));
			}
		}
		return arrayList;
	}

	public bool IsStringDefined(string stringValue)
	{
		return Parse(_enumType, stringValue) != null;
	}

	public bool IsStringDefined(string stringValue, bool ignoreCase)
	{
		return Parse(_enumType, stringValue, ignoreCase) != null;
	}

	public static string GetStringValue(Enum value)
	{
		string result = null;
		Type type = value.GetType();
		if (_stringValues.ContainsKey(value))
		{
			result = (_stringValues[value] as StringValueAttribute).Value;
		}
		else
		{
			FieldInfo field = type.GetField(value.ToString());
			StringValueAttribute[] array = field.GetCustomAttributes(typeof(StringValueAttribute), inherit: false) as StringValueAttribute[];
			if (array.Length != 0)
			{
				_stringValues.Add(value, array[0]);
				result = array[0].Value;
			}
		}
		return result;
	}

	public static object Parse(Type type, string stringValue)
	{
		return Parse(type, stringValue, ignoreCase: false);
	}

	public static object Parse(Type type, string stringValue, bool ignoreCase)
	{
		object result = null;
		string strA = null;
		if (!type.IsEnum)
		{
			throw new ArgumentException($"Supplied type must be an Enum.  Type was {type.ToString()}");
		}
		FieldInfo[] fields = type.GetFields();
		foreach (FieldInfo fieldInfo in fields)
		{
			StringValueAttribute[] array = fieldInfo.GetCustomAttributes(typeof(StringValueAttribute), inherit: false) as StringValueAttribute[];
			if (array.Length != 0)
			{
				strA = array[0].Value;
			}
			if (string.Compare(strA, stringValue, ignoreCase) == 0)
			{
				result = Enum.Parse(type, fieldInfo.Name);
				break;
			}
		}
		return result;
	}

	public static bool IsStringDefined(Type enumType, string stringValue)
	{
		return Parse(enumType, stringValue) != null;
	}

	public static bool IsStringDefined(Type enumType, string stringValue, bool ignoreCase)
	{
		return Parse(enumType, stringValue, ignoreCase) != null;
	}
}
