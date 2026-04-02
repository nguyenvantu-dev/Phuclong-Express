using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class BaoCao_ChiTietCongNoTheoKy : Page
{
	private int pageNum = 1;

	private int pageSize = 100;

	protected Label lbLoi;

	protected DropDownList druser;

	protected Button tbTim;

	protected Button btExportToExcel1Page;

	protected Button btExportToExcelAllWithFilter;

	protected DropDownList ddKy;

	protected Label lbDauKy;

	protected Label lbTongPhatSinh;

	protected Label lbTongThanhToan;

	protected Label lbCuoiKy;

	protected GridView gvCongNo;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadDanhSachKy();
			string value = Page.Request.QueryString["u"];
			if (!string.IsNullOrEmpty(value) && int.TryParse(Page.Request.QueryString["kid"], out var result))
			{
				druser.Items.FindByValue(value).Selected = true;
				ddKy.Items.FindByValue(result.ToString()).Selected = true;
				LoadBaoCaoChiTietCongNo();
			}
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			druser.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			druser.DataBind();
		}
		catch
		{
		}
	}

	private void LoadDanhSachKy()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddKy.DataSource = dBConnect.LayDanhSachKy();
			ddKy.DataBind();
		}
		catch
		{
		}
	}

	private void LoadBaoCaoChiTietCongNo()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.BaoCaoChiTietCongNo(druser.SelectedItem.Value, Convert.ToInt32(ddKy.SelectedValue), Convert.ToInt32(ddKy.SelectedValue), pageSize, pageNum);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				gvCongNo.DataSource = dataSet.Tables[1];
				gvCongNo.DataBind();
				myPager.BuildPaging(pageNum, Convert.ToInt32(dataSet.Tables[0].Rows[0][0]), pageSize);
				DataRow dataRow = dataSet.Tables[3].Rows[0];
				lbDauKy.Text = Convert.ToDouble(dataRow["DauKy"]).ToString("N0");
				lbTongPhatSinh.Text = Convert.ToDouble(dataRow["TongPhatSinh"]).ToString("N0");
				lbTongThanhToan.Text = Convert.ToDouble(dataRow["TongThanhToan"]).ToString("N0");
				lbCuoiKy.Text = Convert.ToDouble(dataRow["CuoiKy"]).ToString("N0");
			}
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadBaoCaoChiTietCongNo();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadBaoCaoChiTietCongNo();
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

	protected void btExportToExcel1Page_Click(object sender, EventArgs e)
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

	protected void btExportToExcelAllWithFilter_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		ExcelUtils excelUtils = new ExcelUtils();
		DataSet dataSet = null;
		dataSet = dBConnect.BaoCaoChiTietCongNo(druser.SelectedItem.Value, Convert.ToInt32(ddKy.SelectedValue), Convert.ToInt32(ddKy.SelectedValue), 10000000, 1);
		int num = 0;
		DataTable dataTable = new DataTable();
		if (dataSet != null && dataSet.Tables.Count > 0)
		{
			num = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]);
			DataView dataView = new DataView(dataSet.Tables[1]);
			dataTable = dataView.ToTable(false, "CongNo_ID", "NoiDung", "NgayGhiNo", "DR", "CR", "LuyKe", "GhiChu");
		}
		base.Response.ClearContent();
		base.Response.Clear();
		base.Response.ContentType = "application/vnd.xls";
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.AppendHeader("Content-Disposition", string.Format("attachment; filename=ChiTietCongNo_{0}.xls", DateTime.Now.ToString("yyyyMMdd_HHmm")));
		base.Response.Charset = Encoding.UTF8.WebName;
		base.Response.HeaderEncoding = Encoding.UTF8;
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.BinaryWrite(Encoding.UTF8.GetPreamble());
		StringBuilder stringBuilder = new StringBuilder();
		stringBuilder.Append("Đầu kỳ," + lbDauKy.Text.Replace(",", ""));
		stringBuilder.Append("\r\n");
		stringBuilder.Append("Tổng phát sinh," + lbTongPhatSinh.Text.Replace(",", ""));
		stringBuilder.Append("\r\n");
		stringBuilder.Append("Đã thanh toán," + lbTongThanhToan.Text.Replace(",", ""));
		stringBuilder.Append("\r\n");
		stringBuilder.Append("Cuối kỳ," + lbCuoiKy.Text.Replace(",", ""));
		stringBuilder.Append("\r\n");
		stringBuilder.Append("\r\n");
		for (int i = 0; i < dataTable.Columns.Count; i++)
		{
			stringBuilder.Append(dataTable.Columns[i].ColumnName + ",");
		}
		stringBuilder.Append("\r\n");
		for (int j = 0; j < dataTable.Rows.Count; j++)
		{
			for (int k = 0; k < dataTable.Columns.Count; k++)
			{
				stringBuilder.Append(dataTable.Rows[j][k].ToString().Replace(",", ";").Replace("\n", " ")
					.Replace("\r", " ") + ",");
			}
			stringBuilder.Append("\r\n");
		}
		base.Response.Output.Write(stringBuilder.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	protected void gvCongNo_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvCongNo.EditIndex = e.NewEditIndex;
			LoadBaoCaoChiTietCongNo();
		}
		catch (Exception)
		{
		}
	}

	protected void gvCongNo_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int congNo_ID = Convert.ToInt32(gvCongNo.DataKeys[e.RowIndex]["CongNo_ID"]);
			TextBox textBox = gvCongNo.Rows[e.RowIndex].FindControl("tbgvNoiDung") as TextBox;
			TextBox textBox2 = gvCongNo.Rows[e.RowIndex].FindControl("tbgvDR") as TextBox;
			TextBox textBox3 = gvCongNo.Rows[e.RowIndex].FindControl("tbgvCR") as TextBox;
			TextBox textBox4 = gvCongNo.Rows[e.RowIndex].FindControl("tbgvGhiChu") as TextBox;
			bool flag = true;
			if (textBox.Text.Trim() == "")
			{
				lbLoi.Text = "Bạn phải nhập nội dung công nợ";
			}
			else
			{
				if (textBox2.Text.Trim() == "" && textBox3.Text.Trim() == "")
				{
					return;
				}
				if (!double.TryParse(textBox2.Text.Trim(), out var result))
				{
					lbLoi.Text = "Tiền Nợ phải là kiểu số";
					return;
				}
				if (!double.TryParse(textBox3.Text.Trim(), out var result2))
				{
					lbLoi.Text = "Tiền Có phải là kiểu số";
					return;
				}
				DBConnect dBConnect = new DBConnect();
				if (dBConnect.CapNhatCongNoSimple(congNo_ID, textBox.Text.Trim(), result, result2, textBox4.Text.Trim(), base.User.Identity.GetUserName()))
				{
					dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ManageCongNo:CapNhatCongNo", StringEnum.GetStringValue(HanhDong.ChinhSua), congNo_ID.ToString(), "ID:" + congNo_ID + "; NoiDung: " + textBox.Text.Trim() + "; DR: " + result + "; CR: " + result2 + "; GhiChu: " + textBox4.Text.Trim() + "; status: " + flag);
					gvCongNo.EditIndex = -1;
					LoadBaoCaoChiTietCongNo();
				}
			}
		}
		catch (Exception)
		{
		}
	}

	protected void gvCongNo_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvCongNo.EditIndex = -1;
		LoadBaoCaoChiTietCongNo();
	}
}
