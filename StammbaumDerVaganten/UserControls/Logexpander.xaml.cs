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
    /// Interaction logic for Log.xaml
    /// </summary>
    public partial class LogExpander : UserControl
    {
        public LogExpander()
        {
            InitializeComponent();
            pfadi_log.ItemsSource = Log.History;
            Log.EntryAdded += HandleLogEntryAdded;
            HandleLogEntryAdded(this.ToString(), Log.HistoryTop);
        }

        private void HandleLogEntryAdded(string author, string entry)
        {
            if (pfadi_logexpander == null)
            {
                return;
            }

            TextBlock text = (TextBlock)pfadi_logexpander.Header;
            if (text == null)
            {
                return;
            }

            if (pfadi_logexpander.IsExpanded)
            {
                text.Text = "Log";
            }
            text.Text = entry;
        }
    }
}
