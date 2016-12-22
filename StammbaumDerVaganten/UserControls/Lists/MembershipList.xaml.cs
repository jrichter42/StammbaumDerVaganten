using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for Membershiplist.xaml
    /// </summary>
    public partial class Membershiplist : UserControl
    {
        public Membershiplist()
        {
            InitializeComponent();
        }

        private void pfadi_membershiplist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {

        }

        private void pfadi_list_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {

        }
    }
}
