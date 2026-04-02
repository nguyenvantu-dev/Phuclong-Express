using System;
using System.Data;
using System.IO;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class BaoCao_InPhieuShipTheoDotHang : Page
{
	protected Button btExportToExcel;

	protected Panel pnThongTinHang;

	protected Label lbLoi;

	protected Label lbHoTen;

	protected Label lbPhoneNumber;

	protected Label lbDiaChiNhanHang;

	protected Label lbNgayVeVN;

	protected Label lbTienShipTrongNuoc;

	protected Label lbTienHang;

	protected Label lbTienShipVeVN;

	protected Label lbTongTien;

	protected Label lbTienDatCoc;

	protected Label lbTienPhaiThanhToan;

	protected GridView gvDonHang;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadBaoCao();
		}
	}

	private void LoadBaoCao()
	{
		try
		{
			string text = Page.Request.QueryString["u"];
			string text2 = Page.Request.QueryString["dh"];
			if (!string.IsNullOrEmpty(text) && !string.IsNullOrEmpty(text2))
			{
				DBConnect dBConnect = new DBConnect();
				DataSet dataSet = dBConnect.BaoCaoInPhieuShipTheoDotHang(text2, text);
				if (dataSet != null && dataSet.Tables.Count > 1)
				{
					DataTable dataTable = dataSet.Tables[0];
					double num = ((dataTable.Rows[0]["TongTien"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataTable.Rows[0]["TongTien"]));
					double num2 = ((dataTable.Rows[0]["TienShipVeVN"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataTable.Rows[0]["TienShipVeVN"]));
					double num3 = ((dataTable.Rows[0]["TienShipTrongNuoc"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataTable.Rows[0]["TienShipTrongNuoc"]));
					double num4 = ((dataTable.Rows[0]["TienHang"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataTable.Rows[0]["TienHang"]));
					double num5 = ((dataTable.Rows[0]["TienDatCoc"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataTable.Rows[0]["TienDatCoc"]));
					lbHoTen.Text = ((dataTable.Rows[0]["HoTen"] == DBNull.Value) ? "" : dataTable.Rows[0]["HoTen"].ToString());
					lbPhoneNumber.Text = ((dataTable.Rows[0]["PhoneNumber"] == DBNull.Value) ? "" : dataTable.Rows[0]["PhoneNumber"].ToString());
					lbDiaChiNhanHang.Text = ((dataTable.Rows[0]["DiaChiNhanHang"] == DBNull.Value) ? "" : dataTable.Rows[0]["DiaChiNhanHang"].ToString());
					lbNgayVeVN.Text = ((dataTable.Rows[0]["NgayVeVN"] == DBNull.Value) ? "" : ((DateTime)dataTable.Rows[0]["NgayVeVN"]).ToString("dd/MM/yyyy"));
					lbTongTien.Text = num.ToString("N0");
					lbTienShipVeVN.Text = num2.ToString("N0");
					lbTienShipTrongNuoc.Text = num3.ToString("N0");
					lbTienHang.Text = num4.ToString("N0");
					lbTienDatCoc.Text = "(" + num5.ToString("N0") + ")";
					lbTienPhaiThanhToan.Text = (num - num5).ToString("N0");
					gvDonHang.DataSource = dataSet.Tables[1];
					gvDonHang.DataBind();
				}
			}
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadBaoCao();
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
		pnThongTinHang.RenderControl(writer);
		string input = stringWriter.ToString();
		input = Regex.Replace(input, "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
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
