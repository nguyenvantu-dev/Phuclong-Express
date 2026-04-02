using System;
using System.Data;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class DotHang_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected DropDownList ddDotHang;

	protected DropDownList ddUserName;

	protected CheckBox cbDaYeuCau;

	protected Button btTimKiem;

	protected Label lbLoi;

	protected GridView gvDotHang;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataUser();
			LoadDataDotHang();
		}
	}

	private void LoadDanhSachDotHang()
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = (cbDaYeuCau.Checked ? dBConnect.LayDotHangDaYeuCau() : dBConnect.LayDotHang(ddDotHang.SelectedValue, ddUserName.SelectedValue));
		gvDotHang.DataSource = dataSet;
		gvDotHang.DataBind();
		if (dataSet != null && dataSet.Tables.Count > 0)
		{
			double num = (from c in dataSet.Tables[0].AsEnumerable()
				where !c.IsNull("CanNang")
				select c.Field<double>("CanNang")).Sum();
			double num2 = (from c in dataSet.Tables[0].AsEnumerable()
				where !c.IsNull("PhiShipVeVN_USD")
				select c.Field<double>("PhiShipVeVN_USD")).Sum();
			double num3 = (from c in dataSet.Tables[0].AsEnumerable()
				where !c.IsNull("PhiShipVeVN_VND")
				select c.Field<double>("PhiShipVeVN_VND")).Sum();
			double num4 = (from c in dataSet.Tables[0].AsEnumerable()
				where !c.IsNull("TienHangUSD")
				select c.Field<double>("TienHangUSD")).Sum();
			double num5 = (from c in dataSet.Tables[0].AsEnumerable()
				where !c.IsNull("TienHangVND")
				select c.Field<double>("TienHangVND")).Sum();
			gvDotHang.FooterRow.Cells[1].Text = "Total";
			gvDotHang.FooterRow.Cells[1].HorizontalAlign = HorizontalAlign.Right;
			gvDotHang.FooterRow.Cells[3].Text = num.ToString("N2");
			gvDotHang.FooterRow.Cells[3].HorizontalAlign = HorizontalAlign.Right;
			gvDotHang.FooterRow.Cells[4].Text = num2.ToString("N2");
			gvDotHang.FooterRow.Cells[4].HorizontalAlign = HorizontalAlign.Right;
			gvDotHang.FooterRow.Cells[6].Text = num3.ToString("N0");
			gvDotHang.FooterRow.Cells[6].HorizontalAlign = HorizontalAlign.Right;
			gvDotHang.FooterRow.Cells[7].Text = num4.ToString("N2");
			gvDotHang.FooterRow.Cells[7].HorizontalAlign = HorizontalAlign.Right;
			gvDotHang.FooterRow.Cells[8].Text = num5.ToString("N0");
			gvDotHang.FooterRow.Cells[8].HorizontalAlign = HorizontalAlign.Right;
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
			ddUserName.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	private void LoadDataDotHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddDotHang.DataSource = dBConnect.LayDanhSachTenDotHang(DateTime.Today.AddYears(-1));
			ddDotHang.DataBind();
		}
		catch
		{
		}
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachDotHang();
	}

	protected void gvDotHang_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvDotHang.EditIndex = -1;
		LoadDanhSachDotHang();
	}

	protected void gvDotHang_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvDotHang.EditIndex = e.NewEditIndex;
			LoadDanhSachDotHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvDotHang_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			string text = gvDotHang.DataKeys[e.RowIndex]["TenDotHang"].ToString();
			string text2 = gvDotHang.DataKeys[e.RowIndex]["UserName"].ToString();
			TextBox textBox = gvDotHang.Rows[e.RowIndex].FindControl("tbgvCanNang") as TextBox;
			TextBox textBox2 = gvDotHang.Rows[e.RowIndex].FindControl("tbgvPhiShipVeVN_USD") as TextBox;
			TextBox textBox3 = gvDotHang.Rows[e.RowIndex].FindControl("tbgvTyGia") as TextBox;
			TextBox textBox4 = gvDotHang.Rows[e.RowIndex].FindControl("tbgvPhiShipVeVN_VND") as TextBox;
			double result;
			if (string.IsNullOrEmpty(textBox.Text.Trim()))
			{
				result = 0.0;
			}
			else if (!double.TryParse(textBox.Text.Trim(), out result))
			{
				lbLoi.Text = "Cân nặng phải là kiểu số";
				return;
			}
			double result2;
			if (string.IsNullOrEmpty(textBox3.Text.Trim()))
			{
				result2 = 0.0;
			}
			else if (!double.TryParse(textBox3.Text.Trim(), out result2))
			{
				lbLoi.Text = "Công ship về VN phải là kiểu số";
				return;
			}
			double result3;
			if (string.IsNullOrEmpty(textBox2.Text.Trim()))
			{
				result3 = 0.0;
			}
			else if (!double.TryParse(textBox2.Text.Trim(), out result3))
			{
				lbLoi.Text = "Phí ship ngoại tệ phải là kiểu số";
				return;
			}
			double result4;
			if (string.IsNullOrEmpty(textBox4.Text.Trim()))
			{
				result4 = 0.0;
			}
			else if (!double.TryParse(textBox4.Text.Trim(), out result4))
			{
				lbLoi.Text = "Phí ship VND kiểu số";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatDotHang(text, text2, result, result3, result2, result4, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DotHang_LietKe:CapNhatDotHang", StringEnum.GetStringValue(HanhDong.ChinhSua), text, "TenDotHang: " + text + "; UserName: " + text2 + "; : " + result + "; PhiShipVeVN_USD: " + result3 + "; TyGia: " + result2 + "; PhiShipVeVN_VND: " + result4);
			gvDotHang.EditIndex = -1;
			LoadDanhSachDotHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvDotHang_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		try
		{
			if (e.CommandName == "TinhTienShip")
			{
				GridViewRow gridViewRow = (GridViewRow)((Control)e.CommandSource).NamingContainer;
				TextBox textBox = gridViewRow.FindControl("tbgvCanNang") as TextBox;
				TextBox textBox2 = gridViewRow.FindControl("tbgvPhiShipVeVN_USD") as TextBox;
				TextBox textBox3 = gridViewRow.FindControl("tbgvTyGia") as TextBox;
				TextBox textBox4 = gridViewRow.FindControl("tbgvPhiShipVeVN_VND") as TextBox;
				double result;
				if (string.IsNullOrEmpty(textBox.Text.Trim()))
				{
					result = 0.0;
				}
				else if (!double.TryParse(textBox.Text.Trim(), out result))
				{
					lbLoi.Text = "Cân nặng phải là kiểu số";
					return;
				}
				double result2;
				if (string.IsNullOrEmpty(textBox3.Text.Trim()))
				{
					result2 = 0.0;
				}
				else if (!double.TryParse(textBox3.Text.Trim(), out result2))
				{
					lbLoi.Text = "Tỷ giá phải là kiểu số";
					return;
				}
				textBox2.Text = "0";
				textBox4.Text = EnhancedMath.RoundUp(result * result2, 0).ToString("N0");
			}
		}
		catch
		{
		}
	}
}
