using System;

namespace OrderMan;

public class StringValueAttribute : Attribute
{
	private string _value;

	public string Value => _value;

	public StringValueAttribute(string value)
	{
		_value = value;
	}
}
