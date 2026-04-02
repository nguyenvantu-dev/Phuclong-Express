using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class LoHang_ChiPhi : Page
{
	protected Label lbLoi;

	protected Label lbLoHang;

	protected GridView gvChiPhi;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
			{
				Page.Response.Redirect("/admin/BaoCao_PhanTichLaiLoTheoLoHang.aspx");
				return;
			}
			lbLoHang.Text = Page.Request.QueryString["id"];
			LoadDataLoHang_ChiPhiLoHang(lbLoHang.Text);
		}
	}

	private void LoadDataLoHang_ChiPhiLoHang(string sTenLoHang)
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayDanhSachLoHang_ChiPhiLoHangByID(sTenLoHang);
		if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
		{
			gvChiPhi.DataKeyNames = new string[1] { "LoHang_ChiPhiLoHangID" };
			gvChiPhi.DataSource = dataSet;
		}
		else
		{
			gvChiPhi.DataKeyNames = new string[0];
			gvChiPhi.DataSource = new object[1];
		}
		gvChiPhi.DataBind();
	}

	protected void gvChiPhi_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && e.Row.DataItem == null)
		{
			e.Row.Visible = false;
		}
		if (e.Row.RowType != DataControlRowType.DataRow || (e.Row.RowState & DataControlRowState.Edit) != DataControlRowState.Edit)
		{
			return;
		}
		DBConnect dBConnect = new DBConnect();
		DropDownList dropDownList = (DropDownList)e.Row.FindControl("ddgvLoaiChiPhiLoHang");
		dropDownList.DataSource = dBConnect.LayDanhSachLoaiChiPhiLoHang();
		dropDownList.DataBind();
		try
		{
			dropDownList.ClearSelection();
			ListItem listItem = dropDownList.Items.FindByValue(DataBinder.Eval(e.Row.DataItem, "LoaiChiPhiLoHangID").ToString());
			if (listItem != null)
			{
				listItem.Selected = true;
			}
		}
		catch
		{
		}
	}

	protected void gvChiPhi_DataBound(object sender, EventArgs e)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DropDownList dropDownList = gvChiPhi.FooterRow.FindControl("ddLoaiChiPhiLoHang") as DropDownList;
			dropDownList.DataSource = dBConnect.LayDanhSachLoaiChiPhiLoHang();
			dropDownList.DataBind();
		}
		catch
		{
		}
	}

	protected void gvChiPhi_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		DropDownList dropDownList = gvChiPhi.FooterRow.FindControl("ddLoaiChiPhiLoHang") as DropDownList;
		TextBox textBox = gvChiPhi.FooterRow.FindControl("tbTienVND") as TextBox;
		if (e.CommandName == "Insert")
		{
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.ThemLoHang_ChiPhiLoHang(lbLoHang.Text, Convert.ToInt32(dropDownList.SelectedValue), Convert.ToDouble(textBox.Text.Trim())))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "LoHang_ChiPhi:Them", StringEnum.GetStringValue(HanhDong.ThemMoi), lbLoHang.Text, "LoHang: " + lbLoHang.Text + "LoaiChiPhiLoHang: " + dropDownList.SelectedValue + "TienVND: " + textBox.Text.Trim());
				LoadDataLoHang_ChiPhiLoHang(lbLoHang.Text);
			}
		}
	}

	protected void gvChiPhi_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvChiPhi.EditIndex = e.NewEditIndex;
			LoadDataLoHang_ChiPhiLoHang(lbLoHang.Text);
		}
		catch (Exception)
		{
		}
	}

	protected void gvChiPhi_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int loHang_ChiPhiLoHangID = Convert.ToInt32(gvChiPhi.DataKeys[e.RowIndex]["LoHang_ChiPhiLoHangID"]);
			DropDownList dropDownList = gvChiPhi.Rows[e.RowIndex].FindControl("ddgvLoaiChiPhiLoHang") as DropDownList;
			TextBox textBox = gvChiPhi.Rows[e.RowIndex].FindControl("tbgvTienVND") as TextBox;
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatLoHang_ChiPhiLoHang(loHang_ChiPhiLoHangID, Convert.ToInt32(dropDownList.SelectedValue), Convert.ToDouble(textBox.Text.Trim()));
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "LoHang_ChiPhi:Sua", StringEnum.GetStringValue(HanhDong.ChinhSua), loHang_ChiPhiLoHangID.ToString(), "LoHang_ChiPhiLoHangID: " + loHang_ChiPhiLoHangID + "LoaiChiPhiLoHang: " + dropDownList.SelectedValue + "TienVND: " + textBox.Text.Trim());
			gvChiPhi.EditIndex = -1;
			LoadDataLoHang_ChiPhiLoHang(lbLoHang.Text);
		}
		catch (Exception)
		{
		}
	}

	protected void gvChiPhi_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvChiPhi.EditIndex = -1;
		LoadDataLoHang_ChiPhiLoHang(lbLoHang.Text);
	}

	protected void gvChiPhi_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int loHang_ChiPhiLoHangID = Convert.ToInt32(gvChiPhi.DataKeys[e.RowIndex]["LoHang_ChiPhiLoHangID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaLoHang_ChiPhiLoHang(loHang_ChiPhiLoHangID))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "LoHang_ChiPhi:Xoa", StringEnum.GetStringValue(HanhDong.Xoa), loHang_ChiPhiLoHangID.ToString(), "ID: " + loHang_ChiPhiLoHangID);
				LoadDataLoHang_ChiPhiLoHang(lbLoHang.Text);
			}
		}
		catch
		{
		}
	}
}
