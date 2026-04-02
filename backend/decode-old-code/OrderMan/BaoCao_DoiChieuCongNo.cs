using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class BaoCao_DoiChieuCongNo : Page
{
	protected Label lbLoi;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected DropDownList druser;

	protected TextBox tbOrderNumber;

	protected Button tbTim;

	protected Button btExportToExcel;

	protected GridView gvDoiChieuCongNo;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			KhoiTaoNgay();
			LoadDataUser();
		}
	}

	private void KhoiTaoNgay()
	{
		try
		{
			DateTime dateTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
			tbTuNgay.Text = dateTime.ToString("dd/MM/yyyy");
		}
		catch
		{
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			druser.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			druser.DataBind();
			druser.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	private void LoadBaoCaoDoiChieuCongNo()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			string tuNgay = "";
			string denNgay = "";
			try
			{
				if (!string.IsNullOrEmpty(tbTuNgay.Text))
				{
					tuNgay = DateTimeUtil.getSqlDatetime(tbTuNgay.Text);
				}
			}
			catch
			{
			}
			try
			{
				if (!string.IsNullOrEmpty(tbDenNgay.Text))
				{
					denNgay = DateTimeUtil.getSqlDatetime(tbDenNgay.Text);
				}
			}
			catch
			{
			}
			DataSet dataSet = dBConnect.BaoCaoDoiChieuCongNo(tuNgay, denNgay, druser.SelectedValue, tbOrderNumber.Text.Trim());
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				gvDoiChieuCongNo.DataSource = dataSet.Tables[0];
				gvDoiChieuCongNo.DataBind();
			}
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadBaoCaoDoiChieuCongNo();
	}

	protected void gvDoiChieuCongNo_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		try
		{
			if (e.CommandName == "ChuyenVeReceived")
			{
				DBConnect dBConnect = new DBConnect();
				if (dBConnect.ChuyenVeReceived(e.CommandArgument.ToString()))
				{
					dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "BaoCao_DoiChieuCongNo:ChuyenVeReceived", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + e.CommandArgument.ToString());
					LoadBaoCaoDoiChieuCongNo();
				}
			}
		}
		catch
		{
		}
	}

	protected void gvDoiChieuCongNo_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvDoiChieuCongNo.EditIndex = -1;
		LoadBaoCaoDoiChieuCongNo();
	}

	protected void gvDoiChieuCongNo_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvDoiChieuCongNo.EditIndex = e.NewEditIndex;
			LoadBaoCaoDoiChieuCongNo();
		}
		catch (Exception)
		{
		}
	}

	protected void gvDoiChieuCongNo_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			string text = gvDoiChieuCongNo.DataKeys[e.RowIndex]["ordernumber"].ToString();
			string text2 = gvDoiChieuCongNo.DataKeys[e.RowIndex]["tracking_number"].ToString();
			TextBox textBox = gvDoiChieuCongNo.Rows[e.RowIndex].FindControl("tbgvSotienBVND") as TextBox;
			double result;
			if (string.IsNullOrEmpty(textBox.Text.Trim()))
			{
				result = 0.0;
			}
			else if (!double.TryParse(textBox.Text.Trim(), out result))
			{
				lbLoi.Text = "Tiền thực trả (VNĐ) phải là kiểu số";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatTongTienOrderVND(text, text2, result);
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "BaoCao_DoiChieuCongNo:CapNhatTongTienOrderVND", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "OrderNumber: " + text + "; TrackingNumber: " + text2 + "; SotienBVND: " + result);
			gvDoiChieuCongNo.EditIndex = -1;
			LoadBaoCaoDoiChieuCongNo();
		}
		catch (Exception)
		{
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
		gvDoiChieuCongNo.RenderControl(writer);
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
