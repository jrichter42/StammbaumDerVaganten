using System.Windows;
using System.Windows.Input;
using MahApps.Metro.Controls;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        MainViewModel vm;

        public MainWindow()
        {
            InitializeComponent();
            vm = (MainViewModel)DataContext;
            if (Keyboard.PrimaryDevice.IsKeyDown(Key.Escape))
            {
                Application.Current.Shutdown();
            }
        }

        private void Load(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Load();
            pfadi_grouplist.ItemsSource = vm.Groups;
            pfadi_rolelist.ItemsSource = vm.Roles;
            pfadi_scoutlist.ItemsSource = vm.Scouts;
            
        }

        private void Save(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Save();
        }
    }
}
