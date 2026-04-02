using System;
using System.Configuration;
using System.Data.SqlClient;

public class DataProvider : IDisposable
{
	public string connectionString = null;

	protected SqlCommand myCommand = null;

	private SqlConnection myConnection = null;

	protected SqlDataAdapter myAdapter = null;

	public SqlCommand CDBCommand => myCommand;

	public SqlDataAdapter CDBAdapter => myAdapter;

	public void Dispose()
	{
		CloseDatabase();
		myCommand = null;
		myConnection = null;
		myAdapter = null;
	}

	public DataProvider()
	{
		connectionString = ConfigurationSettings.AppSettings["DBSHOPConnectionString"];
		myCommand = null;
		myConnection = null;
		myAdapter = null;
	}

	public void OpenDatabase()
	{
		try
		{
			if (connectionString != null)
			{
				myCommand = new SqlCommand();
				myConnection = new SqlConnection(connectionString);
				myAdapter = new SqlDataAdapter();
				myCommand.Connection = myConnection;
				myCommand.Connection.Open();
			}
		}
		catch
		{
		}
	}

	public void CloseDatabase()
	{
		try
		{
			myConnection.Close();
			myCommand.Dispose();
		}
		catch
		{
		}
	}
}
