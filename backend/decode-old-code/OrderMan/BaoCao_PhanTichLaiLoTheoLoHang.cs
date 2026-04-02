using System;
using System.Data;
using System.IO;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class BaoCao_PhanTichLaiLoTheoLoHang : Page
{
	protected Label lbLoi;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected Button tbTim;

	protected Button btExportToExcel;

	protected GridView gvLoHang;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			KhoiTaoNgay();
		}
	}

	private void KhoiTaoNgay()
	{
		try
		{
			DateTime dateTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
			DateTime dateTime2 = dateTime.AddMonths(1).AddDays(-1.0);
			tbTuNgay.Text = dateTime.ToString("dd/MM/yyyy");
			tbDenNgay.Text = dateTime2.ToString("dd/MM/yyyy");
		}
		catch
		{
		}
	}

	private void LoadBaoCaoPhanTichLaiLoTheoLoHang()
	{
		try
		{
			string[] array = tbTuNgay.Text.Trim().Split('/');
			if (array.Length == 3)
			{
				DateTime tuNgay = new DateTime(Convert.ToInt32(array[2]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]), 0, 0, 0);
				string[] array2 = tbDenNgay.Text.Trim().Split('/');
				if (array2.Length == 3)
				{
					DateTime denNgay = new DateTime(Convert.ToInt32(array2[2]), Convert.ToInt32(array2[1]), Convert.ToInt32(array2[0]), 23, 59, 59);
					DBConnect dBConnect = new DBConnect();
					DataSet dataSet = dBConnect.BaoCaoPhanTichLaiLoTheoLoHang(tuNgay, denNgay);
					if (dataSet != null && dataSet.Tables.Count > 0)
					{
						gvLoHang.DataSource = dataSet.Tables[0];
						gvLoHang.DataBind();
					}
				}
				else
				{
					lbLoi.Text = "Thông tin đến ngày chưa đúng!!!";
				}
			}
			else
			{
				lbLoi.Text = "Thông tin từ ngày chưa đúng!!!";
			}
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadBaoCaoPhanTichLaiLoTheoLoHang();
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
		gvLoHang.RenderControl(writer);
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
