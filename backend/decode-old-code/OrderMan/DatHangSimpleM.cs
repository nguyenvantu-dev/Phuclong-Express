using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DatHangSimpleM : Page
{
	protected Label lbLoi;

	protected TextBox tbLinkHang;

	protected TextBox tbLinkHinh;

	protected TextBox tbMausac;

	protected TextBox tbSize;

	protected TextBox tbSoluong;

	protected TextBox tbGiaweb;

	protected TextBox tbGhichu;

	protected DropDownList drLoaitien;

	protected TextBox tbTyGia;

	protected Button btNhapLai;

	protected Button btDathang;

	protected void Page_Load(object sender, EventArgs e)
	{
		LoadDataTyGia();
	}

	private void LoadDataTyGia()
	{
		try
		{
			BLL bLL = new BLL();
			List<TyGia> dataSource = bLL.LayDanhSachTyGia();
			drLoaitien.DataSource = dataSource;
			drLoaitien.DataBind();
			ListItem listItem = drLoaitien.Items.FindByText("USD");
			if (listItem != null)
			{
				drLoaitien.ClearSelection();
				listItem.Selected = true;
			}
			tbTyGia.Text = drLoaitien.SelectedValue;
		}
		catch
		{
		}
	}

	protected void btDathang_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbLinkHang.Text.Trim()) || string.IsNullOrEmpty(tbLinkHinh.Text.Trim()) || string.IsNullOrEmpty(tbSoluong.Text.Trim()) || string.IsNullOrEmpty(tbGiaweb.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng điền đầy đủ thông tin bắt buộc!!!";
			return;
		}
		if (!int.TryParse(tbSoluong.Text.Trim(), out var result))
		{
			lbLoi.Text = "Số lượng phải là kiểu số";
			return;
		}
		if (!double.TryParse(tbGiaweb.Text.Trim(), out var result2))
		{
			lbLoi.Text = "Đơn giá phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		Uri uri = new Uri(tbLinkHang.Text.Trim());
		string host = uri.Host;
		BLL bLL = new BLL();
		List<Website> list = bLL.LayDanhSachWebsite();
		Website website = list.Find((Website item) => host.Contains(item.WebsiteName));
		if (website != null)
		{
			host = website.WebsiteName;
		}
		if (dBConnect.ThemDatHangSimple(host, base.User.Identity.GetUserName(), base.User.Identity.GetUserName(), tbLinkHang.Text.Trim(), tbLinkHinh.Text.Trim(), tbMausac.Text.Trim(), tbSize.Text.Trim(), result, result2, drLoaitien.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), Convert.ToDouble(drLoaitien.SelectedValue), 0.0, HangKhoan: false, null, "", null))
		{
			lbLoi.Text = "Đã đặt hàng thành công";
			ClearInputData();
		}
		else
		{
			lbLoi.Text = "Đặt hàng không thành công, vui lòng thao tác lại!!!";
		}
	}

	private void ClearInputData()
	{
		tbLinkHang.Text = "";
		tbLinkHinh.Text = "";
		tbMausac.Text = "";
		tbSize.Text = "";
		tbSoluong.Text = "";
		tbGiaweb.Text = "";
		tbGhichu.Text = "";
	}

	protected void btNhapLai_Click(object sender, EventArgs e)
	{
		ClearInputData();
	}

	protected void drLoaitien_SelectedIndexChanged(object sender, EventArgs e)
	{
		tbTyGia.Text = drLoaitien.SelectedValue;
	}
}
