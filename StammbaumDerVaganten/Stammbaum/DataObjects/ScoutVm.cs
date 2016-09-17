using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class ScoutVm : Viewmodel<Scout>
    {
        protected ObservableCollection<MembershipVm> memberships;
        protected ObservableCollection<ActivityVm> activities;

        public string Forename
        {
            get { return model.Forename.Value; }
            set
            {
                if (model.Forename.Value != value)
                {
                    model.Forename.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Lastname
        {
            get { return model.Lastname.Value; }
            set
            {
                if (model.Lastname.Value != value)
                {
                    model.Lastname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Scoutname
        {
            get { return model.Scoutname.Value; }
            set
            {
                if (model.Scoutname.Value != value)
                {
                    model.Scoutname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime Birthdate
        {
            get { return model.Birthdate.Value; }
            set
            {
                if (model.Birthdate.Value != value)
                {
                    model.Birthdate.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string ContactInfo
        {
            get { return model.ContactInfo.Value; }
            set
            {
                if (model.ContactInfo.Value != value)
                {
                    model.ContactInfo.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Comment
        {
            get { return model.Comment.Value; }
            set
            {
                if (model.Comment.Value != value)
                {
                    model.Comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<MembershipVm> Memberships
        {
            get { return memberships; }
            set
            {
                if (memberships != value)
                {
                    memberships = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<ActivityVm> Activities
        {
            get { return activities; }
            set
            {
                if (activities != value)
                {
                    activities = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ScoutVm(ref Scout scout) : base(ref scout)
        {
            memberships = new ObservableCollection<MembershipVm>();
            for (int i = 0; i < scout.Memberships.Count; i++)
            {
                Membership membership = scout.Memberships [i];
                MembershipVm membershipVm = new MembershipVm(ref membership);
                memberships.Add(membershipVm);
            }

            activities = new ObservableCollection<ActivityVm>();
            for (int i = 0; i < scout.Activities.Count; i++)
            {
                Activity activity = scout.Activities[i];
                ActivityVm activityVm = new ActivityVm(ref activity);
                activities.Add(activityVm);
            }
        }
    }
}
