using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class TrackingNumber : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected Label lbLoi;

	protected TextBox tbTimTheoOrderNumber;

	protected TextBox tbTimTheoTrackingNumber;

	protected Button btTimKiem;

	protected GridView gvListOrder;

	protected ucPhanTrang myPager;

	protected TextBox tbTrackingNumber;

	protected TextBox tbNgayNhanTaiNuocNgoai;

	protected TextBox tbTrackingLink;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
		}
	}

	private void LoadDanhSachListOrder()
	{
		try
		{
			lbLoi.Text = "";
			BLL bLL = new BLL();
			ListOrderPhanTrang listOrderPhanTrang = bLL.LayDanhSachListOrder(tbTimTheoOrderNumber.Text.Trim(), tbTimTheoTrackingNumber.Text.Trim(), pageSize, pageNum);
			gvListOrder.DataSource = listOrderPhanTrang.DanhSachListOrder;
			gvListOrder.DataBind();
			myPager.BuildPaging(pageNum, listOrderPhanTrang.TotalItem, pageSize);
		}
		catch
		{
		}
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachListOrder();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachListOrder();
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		lbLoi.Text = "";
		string text = "";
		for (int i = 0; i < gvListOrder.Rows.Count; i++)
		{
			if (((RadioButton)gvListOrder.Rows[i].FindControl("rbtChon")).Checked)
			{
				text = gvListOrder.DataKeys[i]["ordernumber"].ToString();
				break;
			}
		}
		if (string.IsNullOrEmpty(text))
		{
			lbLoi.Text = "Phải chọn một order number";
			return;
		}
		if (string.IsNullOrEmpty(tbTrackingNumber.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập tracking number";
			return;
		}
		if (string.IsNullOrEmpty(tbNgayNhanTaiNuocNgoai.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập ngày nhận hàng tại nước ngoài";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.CapNhatTrackingNumber(text, tbTrackingNumber.Text.Trim(), DateTimeUtil.getDatetimeFromStr(tbNgayNhanTaiNuocNgoai.Text.Trim()), tbTrackingLink.Text.Trim()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "TrackingNumber:CapNhatTrackingNumber", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "OrderNumber: " + text + "; tbTrackingNumber: " + tbTrackingNumber.Text.Trim() + "; NgayNhanTaiNuocNgoai: " + tbNgayNhanTaiNuocNgoai.Text.Trim() + "; TrackingLink: " + tbTrackingLink.Text.Trim());
			lbLoi.Text = "Đã cập nhật thành công";
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
