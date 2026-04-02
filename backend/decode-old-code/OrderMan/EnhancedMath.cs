using System;

namespace OrderMan;

public static class EnhancedMath
{
	private delegate double RoundingFunction(double value);

	private enum RoundingDirection
	{
		Up,
		Down
	}

	public static double RoundUp(double value, int precision)
	{
		return Round(value, precision, RoundingDirection.Up);
	}

	public static double RoundDown(double value, int precision)
	{
		return Round(value, precision, RoundingDirection.Down);
	}

	private static double Round(double value, int precision, RoundingDirection roundingDirection)
	{
		RoundingFunction roundingFunction = ((roundingDirection != RoundingDirection.Up) ? new RoundingFunction(Math.Floor) : new RoundingFunction(Math.Ceiling));
		value *= Math.Pow(10.0, precision);
		value = roundingFunction(value);
		return value * Math.Pow(10.0, -1 * precision);
	}
}
