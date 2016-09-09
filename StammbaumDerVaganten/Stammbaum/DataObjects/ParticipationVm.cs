using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{

    public class ParticipationVm<T> : Viewmodel<T> where T : Participation
    {
        public int StartTimepoint_
        {
            get { return model.Timespan.StartTimepoint; }
            set
            {
                if (model.Timespan.StartTimepoint != value)
                {
                    model.Timespan.StartTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("CustomStart_");
                }
            }
        }

        public int EndTimepoint_
        {
            get { return model.Timespan.EndTimepoint; }
            set
            {
                if (model.Timespan.EndTimepoint != value)
                {
                    model.Timespan.EndTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("CustomEnd_");
                }
            }
        }

        public bool CustomStart_
        {
            get { return model.Timespan.CustomStart_; }
        }

        public bool CustomEnd_
        {
            get { return model.Timespan.CustomEnd_; }
        }

        public DateTime Start_
        {
            get { return model.Timespan.Start.Value; }
            set
            {
                if (model.Timespan.Start_ != value)
                {
                    model.Timespan.Start_ = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End_
        {
            get { return model.Timespan.End.Value; }
            set
            {
                if (model.Timespan.End_ != value)
                {
                    model.Timespan.End_ = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int Group
        {
            get { return model.Group; }
            set
            {
                if (model.Group != value)
                {
                    model.Group = value;
                    NotifyPropertyChanged();
                }
            }
        }


        #region FilteredGroups
        protected ObservableCollection<Group> filteredGroups;

        public ObservableCollection<Group> FilteredGroups
        {
            get
            {
                UpdateFilteredGroups();
                return filteredGroups;
            }
        }

        protected virtual void UpdateFilteredGroups()
        {
            if (filteredGroups == null)
            {
                filteredGroups = new ObservableCollection<Group>();
            }

            filteredGroups.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Group> groups = vm.Groups;
            if (groups == null)
            {
                return;
            }

            foreach (Group g in groups)
            {
                if (g.Type != GroupType_Type.None)
                {
                    filteredGroups.Add(g);
                }
            }

            //Sort by start year, youngest group first
            int newIdx;
            for (int i = 1; i < groups.Count; i++)
            {
                newIdx = i - 1;
                //Quit if our year is already smaller or equal to the year before us
                if (groups[i].Timespan.Start.Year <= groups[newIdx].Timespan.Start.Year)
                {
                    continue;
                }
                while (newIdx > 0 && groups[i].Timespan.Start.Year > groups[newIdx - 1].Timespan.Start.Year)
                {
                    newIdx--;
                }
                groups.Move(i, newIdx);
            }
        }
        #endregion

        #region FilteredTimepoints
        protected ObservableCollection<Timepoint> filteredTimepoints;

        public ObservableCollection<Timepoint> FilteredTimepoints
        {
            get
            {
                if (filteredTimepoints == null)
                {
                    filteredTimepoints = new ObservableCollection<Timepoint>();
                }

                Data data = MainViewModel.ActiveData;
                if (data != null && (data.Timepoints.Count + 1) != filteredTimepoints.Count)
                {
                    UpdateFilteredTimepoints();
                }
                return filteredTimepoints;
            }
        }

        protected virtual void UpdateFilteredTimepoints()
        {
            filteredTimepoints.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Timepoint> timepoints = vm.Timepoints;
            if (timepoints == null)
            {
                return;
            }

            foreach (Timepoint t in timepoints)
            {
                if (t.Date_ >= model.Timespan.Start_ && t.Date_ <= model.Timespan.End_)
                {
                    filteredTimepoints.Add(t);
                }
            }

            //Sort by date, youngest timepoint first
            int newIdx;
            for (int i = 1; i < filteredTimepoints.Count; i++)
            {
                newIdx = i - 1;
                //Quit if our year is already smaller or equal to the year before us
                if (filteredTimepoints[i].Date.Year <= filteredTimepoints[newIdx].Date.Year)
                {
                    continue;
                }
                while (newIdx > 0 && filteredTimepoints[i].Date.Year > filteredTimepoints[newIdx - 1].Date.Year)
                {
                    newIdx--;
                }
                filteredTimepoints.Move(i, newIdx);
            }

            //Insert reset item
            filteredTimepoints.Insert(0, Timepoint.INVALID);
        }
        #endregion

        public ParticipationVm(ref T participation) : base(ref participation)
        {

        }
    }

    public class MembershipVm : ParticipationVm<Membership>
    {

        public MembershipVm(ref Membership membership) : base(ref membership)
        {

        }
    }

    public class ActivityVm : ParticipationVm<Activity>
    {
        public int Role
        {
            get { return model.Role; }
            set
            {
                if (model.Role != value)
                {
                    model.Role = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region INotifyPropertyChanged w Filters Hack
        private new void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (propertyName == "Groups")
            {
                NotifyPropertyChanged("FilteredRoles");
            }
            /*else if (propertyName == "Roles")
            {
                NotifyPropertyChanged("FilteredGroups");
            }*/

            base.NotifyPropertyChanged(propertyName);
        }
        #endregion

        #region FilteredGroups & FilteredRoles
        protected override void UpdateFilteredGroups()
        {
            if (filteredGroups == null)
            {
                filteredGroups = new ObservableCollection<Group>();
            }

            filteredGroups.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Group> groups = vm.Groups;
            if (groups == null)
            {
                return;
            }

            GroupType_Type groupTypeFilter = GroupType_Type.None;
            if (model.Role != StammbaumDerVaganten.Role.ID_INVALID)
            {
                Data data = MainViewModel.ActiveData;
                if (data != null)
                {
                    Role r = data.GetRoleByID(model.Role);
                    if (r != null)
                    {
                        groupTypeFilter = r.GroupType;
                    }
                }
            }

            foreach (Group g in groups)
            {
                if (groupTypeFilter == GroupType_Type.None
                    || g.Type == groupTypeFilter
                    || g.ID == model.Group)
                {
                    filteredGroups.Add(g);
                }
            }
        }

        protected ObservableCollection<Role> filteredRoles;

        public ObservableCollection<Role> FilteredRoles
        {
            get
            {
                UpdateFilteredRoles();
                return filteredRoles;
            }
        }
        protected virtual void UpdateFilteredRoles()
        {
            if (filteredRoles == null)
            {
                filteredRoles = new ObservableCollection<Role>();
            }

            filteredRoles.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Role> roles = vm.Roles;
            if (roles == null)
            {
                return;
            }

            /*GroupType_Type groupTypeFilter = GroupType_Type.None;
            if (group != ID_INVALID)
            {
                Data data = MainViewModel.ActiveData;
                if (data != null)
                {
                    Group g = data.GetGroupByID(group);
                    if (g != null)
                    {
                        groupTypeFilter = g.Type;
                    }
                }
            }*/

            foreach (Role r in roles)
            {
                /*if (groupTypeFilter == GroupType_Type.None || r.GroupType == groupTypeFilter)
                {*/
                filteredRoles.Add(r);
                //}
            }
        }
        #endregion

        public ActivityVm(ref Activity activity) : base(ref activity)
        {

        }
    }
}
