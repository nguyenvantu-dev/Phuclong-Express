using System;
using System.Data;
using System.Drawing;
using System.IO;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class BaoCao_CongNoKhachHang : Page
{
	protected Button btExportToExcel;

	protected GridView gvCongNo;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadBaoCaoCongNoKhachhang();
		}
	}

	private void LoadBaoCaoCongNoKhachhang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.BaoCaoCongNoKhachHang();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				gvCongNo.DataSource = dataSet.Tables[0];
				gvCongNo.DataBind();
			}
		}
		catch
		{
		}
	}

	protected void gvCongNo_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && e.Row.RowType == DataControlRowType.DataRow)
		{
			DataRowView dataRowView = (DataRowView)e.Row.DataItem;
			if (Convert.ToDouble(dataRowView["PhanTram"]) > 30.0)
			{
				e.Row.ForeColor = Color.FromName("Red");
			}
			else
			{
				e.Row.ForeColor = Color.FromName("Black");
			}
		}
	}

	protected void ExportToExcel()
	{
		base.Response.Clear();
		base.Response.Buffer = true;
		base.Response.AddHeader("content-disposition", "attachment;filename=DanhSachDatHang.xls");
		base.Response.Charset = "";
		base.Response.ContentType = "application/vnd.xlsx";
		StringWriter stringWriter = new StringWriter();
		HtmlTextWriter writer = new HtmlTextWriter(stringWriter);
		gvCongNo.RenderControl(writer);
		string input = Regex.Replace(stringWriter.ToString(), "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<input type=\"checkbox\"\\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<a \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		base.Response.Write(input.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	protected void btExportToExcel_Click(object sender, EventArgs e)
	{
		ExportToExcel();
	}

	public override void VerifyRenderingInServerForm(Control control)
	{
	}
}
